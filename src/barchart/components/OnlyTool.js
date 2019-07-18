import * as Defaults from "../defaults/BarchartDefaults";
import Component from "./Component";
import style from "../Barchart.css";
import * as d3 from "d3";
import * as BarchartUtils from "../utils/BarchartUtils";

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
	}

	_render() {

		this._onlyToolTextSvg = this.container.append("text")
			.text(this.onlyToolText)
			.attr("class", style["onlyTool"])
			.attr("x", "-7")
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

		this.width = BarchartUtils.calculateTextWidth(this._onlyToolTextSvg, this._canvas) + 14;
	}

	get onlyToolText() {
		return this._onlyToolText;
	}

	get fontSize() {
		return this._fontSize;
	}
}

export default OnlyTool;
