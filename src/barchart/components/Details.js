import * as Defaults from "../defaults/BarchartDefaults";
import Component from "./Component";
import style from "../Barchart.css";
import * as d3 from "d3";
import Tooltip from "./Tooltip";

class Details extends Component {

	constructor(
		{
			width = Defaults.WIDTH,
			height = labelFontSize + 10,
			labelFontSize = Defaults.LABEL_FONT_SIZE,
			tooltipFontSize = Defaults.TOOLTIP_FONT_SIZE,
			tooltipSymbol = Defaults.TOOLTIP_SYMBOL,
			activeColors = Defaults.ACTIVE_COLORS,
			format = Defaults.FORMAT,
		}
	) {
		super(width, height, "details");
		this._labelFontSize = labelFontSize;
		this._tooltipFontSize = tooltipFontSize;
		this._tooltipSymbol = tooltipSymbol;
		this._activeColors = activeColors;
		this._format = format;

		this._tooltips;
	}

	_render() {

		this.container.append("text")
			.text("-")
			.attr("class", style["label"])
			.attr("x", Defaults.HORIZONTAL_PADDING)
			.attr("y", this.labelFontSize)
			.attr("font-size", this.labelFontSize);

	}

	/**
	 * @param {DetailsData} data
	 */
	_setData(data) {

		this.container.select(`.${style["label"]}`).text(data.label);

		this.container.classed(style['details-disabled'], data.disabled);

		if (typeof data.tooltips !== 'undefined') {
			this.updateTooltipsData(data.tooltips, data.getPrecision("max"), data.color);
		}
	}

	/**
	 * @param {TooltipData[]} tooltipsData
	 * @param {number} precision
	 * @param {String} color
	 */
	updateTooltipsData(tooltipsData, precision, color) {

		this.container.selectAll(`.${style["tooltip"]}`).remove();

		const tooltipsReversed = tooltipsData.slice();
		tooltipsReversed.reverse();

		let format = this.format;
		if (!this.format.includes('.')) {
			const spec = d3.formatSpecifier(this.format);
			spec.precision = precision;
			format = spec.toString();
		}

		let previousTooltipX = this.width - Defaults.HORIZONTAL_PADDING;

		this._tooltips = tooltipsData.map((_, index) => new Tooltip({
			fontSize: this.tooltipFontSize,
			symbol: tooltipsData.length>1 ? this.tooltipSymbol : undefined,
			activeColor: color ? color : this.activeColors[index % 2],
			format: format
		}));
		this._tooltips.forEach((_, index) => {
			const reversedIndex = this._tooltips.length - 1 - index;
			const tooltipReversed = this._tooltips[reversedIndex];
			const tooltipData = tooltipsData[reversedIndex];

			tooltipReversed.render(this.container.node(), previousTooltipX, this.labelFontSize, reversedIndex);
			tooltipReversed.setData(tooltipData);

			previousTooltipX -= tooltipReversed.width + 24;
		});

	}

	_clearData() {
		this.container.select(`.${style["label"]}`).text("-");
		this.container.selectAll(`.${style["tooltip"]}`).remove();
	}

	get labelFontSize() {
		return this._labelFontSize;
	}

	get tooltipFontSize() {
		return this._tooltipFontSize;
	}

	get tooltipSymbol() {
		return this._tooltipSymbol;
	}

	get activeColors() {
		return this._activeColors;
	}

	get format() {
		return this._format;
	}
}

export default Details;
