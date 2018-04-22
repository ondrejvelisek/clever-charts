import * as Defaults from "../defaults/BarchartDefaults";
import Component from "./Component";
import style from "../Barchart.css";
import * as d3 from "d3";

class Tooltip extends Component {

	constructor(
		{
			fontSize = Defaults.TOOLTIP_FONT_SIZE,
			width = fontSize,
			height = fontSize,
			symbol,
			activeColor = Defaults.ACTIVE_COLORS[0],
			format = Defaults.FORMAT,
			space = Defaults.TOOLTIP_SPACE
		}
	) {
		super(width, height, "tooltip", true, true);
		this._fontSize = fontSize;
		this._symbol = symbol;
		this._activeColor = activeColor;
		this._format = format;
		this._space = space;
	}

	_render() {

		this.container.append("text")
			.text("-")
			.attr("class", style["tooltip-text"])
			.attr("text-anchor","end")
			.attr("font-size", this.fontSize);

	}

	/**
	 * @param {TooltipData} data
	 */
	_setData(data) {

		let format = this.format;
		if (!this.format.includes('.')) {
			const spec = d3.formatSpecifier(this.format);
			spec.precision = data.getPrecision("max");
			format = spec.toString();
		}

		let text = data.text;
		if (data.isNumber()) {
			text = d3.format(format)(data.text);
		}

		const tooltipText = this.container.select(`.${style["tooltip-text"]}`)
			.text(text);

		let tooltipWidth = tooltipText.node().getBBox().width;

		if (data.symbol || this.symbol) {

			const tooltipSymbol = this.container.append("text")
				.text(data.symbol ? data.symbol : this.symbol)
				.attr("class", style["symbol"])
				.attr("text-anchor","end")
				.attr("font-size", this.fontSize)
				.attr("fill", data.color ? data.color : this.activeColor)
				.attr("x", -tooltipWidth - this.space);

			tooltipWidth += tooltipSymbol.node().getBBox().width + this.space;
		}

		this.width = tooltipWidth;
		this.height = tooltipText.node().getBBox().height;

	}

	_clearData() {
		this.container.select(`.${style["tooltip-text"]}`)
			.text("-");

		this.container.select(`.${style["symbol"]}`).remove()
	}

	get fontSize() {
		return this._fontSize;
	}

	get symbol() {
		return this._symbol;
	}

	get activeColor() {
		return this._activeColor;
	}

	get format() {
		return this._format;
	}

	get space() {
		return this._space;
	}
}

export default Tooltip;
