import * as Defaults from "../defaults/BarchartDefaults";
import Component from "./Component";
import style from "../Barchart.css";
import * as d3 from "d3";

class OnlyTool extends Component {

	constructor(
		{
			fontSize = Defaults.TOOLTIP_FONT_SIZE,
			onlyToolText = Defaults.ONLY_TOOL_TEXT,
			width = fontSize,
			height = fontSize,
		}
	) {
		super(width, height, "onlyTool", true, true);
		this._fontSize = fontSize;
		this._onlyToolText = onlyToolText;

		this._canvas;

		this._observable
			.add("selectOnly");
	}

	_render() {

		this._onlyToolTextSvg = this.container.append("text")
			.text(this.onlyToolText)
			.attr("class", style["onlyTool"])
			.attr("text-anchor","end")
			.attr("font-size", this.fontSize);

		if (d3.select(".text-width-helper").empty()) {
			this._canvas = d3.select("body")
				.append('canvas')
				.attr("class", "text-width-helper")
				.style("display","none")
				.text("Helper element for computing text width");
		} else {
			this._canvas = d3.select(".text-width-helper");
		}

		this._doSelectOnly();

		this.width = this._calculateTextWidth(this._onlyToolTextSvg);
	}

	_doSelectOnly() {
		this.container.attr("cursor", "pointer");
		this.on("click", (index) => {
			d3.event.stopPropagation();
			this._observable.fire("selectOnly", index);
		});
	}

	_calculateTextWidth(element) {

		const context = this._canvas.node().getContext("2d");

		const style = window.getComputedStyle(element.node());
		const fontStyle = style.getPropertyValue("font-style");
		const fontVariant = style.getPropertyValue("font-variant");
		const fontWeight = style.getPropertyValue("font-weight");
		const fontStrech = style.getPropertyValue("font-strech");
		const fontSize = style.getPropertyValue("font-size");
		const fontFamily = style.getPropertyValue("font-family");
		context.font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontStrech} ${fontSize} ${fontFamily}`;

		var metrics = context.measureText(element.text());
		return metrics.width;
	}

	get onlyToolText() {
		return this._onlyToolText;
	}

	get fontSize() {
		return this._fontSize;
	}
}

export default OnlyTool;
