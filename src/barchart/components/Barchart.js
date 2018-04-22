import * as Defaults from "../defaults/BarchartDefaults";
import Component from "./Component";
import Bar from "./Bar";
import Details from "./Details";
import style from "../Barchart.css";
import * as d3 from "d3";

class Barchart extends Component {

	constructor(
		{
			width = Defaults.WIDTH,
			height = Defaults.HEIGHT,
			labelFontSize = Defaults.LABEL_FONT_SIZE,
			tooltipFontSize = Defaults.TOOLTIP_FONT_SIZE,
			tooltipSymbol = Defaults.TOOLTIP_SYMBOL,
			activeColors = Defaults.ACTIVE_COLORS,
			minMax = Defaults.MINMAX,
			detailsVisible = Defaults.DETAILS_HIDDEN,
			detailsHeight = labelFontSize + 10,
			dualValue = Defaults.DUAL_VALUE,
			barHeight = Defaults.BAR_HEIGHT,
			enableBarHover = Defaults.ENABLE_BAR_HOVER,
			enableBarToggle = Defaults.ENABLE_BAR_TOGGLE,
			format = Defaults.FORMAT,
			stripeBackgroundColor = Defaults.STRIPE_BACKGROUND_COLOR
		}
	) {
		super(width, height, "barchart");
		this._labelFontSize = labelFontSize;
		this._tooltipFontSize = tooltipFontSize;
		this._tooltipSymbol = tooltipSymbol;
		this._activeColors = activeColors;
		this._minMax = minMax;
		this._detailsVisible = detailsVisible;
		this._detailsHeight = detailsHeight;
		this._dualValue = dualValue;
		this._barHeight = barHeight;
		this._enableBarHover = enableBarHover;
		this._enableBarToggle = enableBarToggle;
		this._format = format;
		this._stripeBackgroundColor = stripeBackgroundColor;

		this._observable
			.add("barEnter")
			.add("barLeave")
			.add("barLeftEnter")
			.add("barLeftLeave")
			.add("barRightEnter")
			.add("barRightLeave")
			.add("barMiddleEnter")
			.add("barMiddleLeave")
			.add("barClick")
			.add("barDisabled")
			.add("barsEnter")
			.add("barsLeave");

	}

	_renderContainer(selector, x = 0, y = 0){

		this._svgWrapper = d3.select(selector).append("svg")
			.attr("class", style[this.className])
			.attr("width", this.width)
			.attr("height", this.height);

		this._svgWrapper.style({
				'position': 'relative',
				'left': x,
				'top': y
			});

		return this._svgWrapper.append("g")
	}

	_render() {
		if (this.detailsVisible) {
			this._details = new Details({
				width: this.width,
				height: this.detailsHeight,
				labelFontSize: this.labelFontSize,
				tooltipFontSize: this.tooltipFontSize,
				tooltipSymbol: this.tooltipSymbol,
				activeColors: this.activeColors,
				format: this.format
			});
			this._details.render(this._container.node(), 0, 0);
		}
	}

	/**
	 * @param {BarchartData} data
	 */
	_setData(data) {

		let height = data.bars.length * this.barHeight;
		if (this.detailsVisible) {
			this._details.setData(data.details);
			height += this.detailsHeight;
		}
		this.height = height;
		this._svgWrapper.attr("height", height);

		let format = this.format;
		if (!this.format.includes('.')) {
			const spec = d3.formatSpecifier(this.format);
			spec.precision = data.getPrecision("max");
			format = spec.toString();
		}

		const minMax = data.calculateMinMax(this.minMax);

		const bars = data.bars.map(() => new Bar({
			width: this.width,
			height: this.barHeight,
			labelFontSize: this.labelFontSize,
			tooltipFontSize: this.tooltipFontSize,
			tooltipSymbol: this.tooltipSymbol,
			activeColors: data.color ? [data.color] : this.activeColors,
			detailsHidden: this.detailsVisible,
			detailsHeight: this.detailsHeight,
			dualValue: this.dualValue,
			enableToggle: this.enableBarToggle,
			enableHover: this.enableBarHover,
			minMax: minMax,
			format: format,
			stripeBackgroundColor: this.stripeBackgroundColor
		}));
		data.bars.forEach((barData, index) => {
			const bar = bars[index];

			const barsContainer = this._container.append("g")
				.on("mouseenter", () => {
					this._observable.fire("barsEnter");
				})
				.on("mouseleave", () => {
					this._observable.fire("barsLeave");
				});

			const topDetailsWidth = (this.detailsVisible ? this.detailsHeight : 0);
			bar.render(barsContainer.node(), 0, topDetailsWidth + this.barHeight*index, index)
				.on("click", (index) => {
					this._observable.fire("barClick", index);
				})
				.on("enter", (index) => {
					console.log("HERE", index)
					this._observable.fire("barEnter", index);
				})
				.on("leave", (index) => {
					this._observable.fire("barLeave", index);
				})
				.on("leftEnter", (index) => {
					this._observable.fire("barLeftEnter", index);
				})
				.on("leftLeave", (index) => {
					this._observable.fire("barLeftLeave", index);
				})
				.on("rightEnter", (index) => {
					this._observable.fire("barRightEnter", index);
				})
				.on("rightLeave", (index) => {
					this._observable.fire("barRightLeave", index);
				})
				.on("middleEnter", (index) => {
					this._observable.fire("barMiddleEnter", index);
				})
				.on("middleLeave", (index) => {
					this._observable.fire("barMiddleLeave", index);
				});

			bar.setData(barData);
		});
	}

	_clearData() {
		if (this.detailsVisible) {
			this._details.clearData();
		}
		this._container.selectAll(`.${style["bar"]}`).remove();
	}

	setDetailsData(detailsData) {
		if (this.detailsVisible) {
			this._details.setData(detailsData);
		} else {
			throw "Cannot set data to details component. Parameter detailsVisible is set to false";
		}
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

	get minMax() {
		return this._minMax;
	}

	get detailsVisible() {
		return this._detailsVisible;
	}

	get detailsHeight() {
		return this._detailsHeight;
	}

	get dualValue() {
		return this._dualValue;
	}

	get barHeight() {
		return this._barHeight;
	}

	get enableBarHover() {
		return this._enableBarHover;
	}

	get enableBarToggle() {
		return this._enableBarToggle;
	}

	get format() {
		return this._format;
	}

	get stripeBackgroundColor() {
		return this._stripeBackgroundColor;
	}
}

export default Barchart;
