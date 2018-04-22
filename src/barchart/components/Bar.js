import * as Defaults from "../defaults/BarchartDefaults";
import Component from "./Component";
import Details from "./Details";
import Stripe from "./Stripe";
import Hover from "./Hover";
import style from "../Barchart.css";
import TooltipData from "../data/TooltipData";

class Bar extends Component {

	constructor(
		{
			width = Defaults.WIDTH,
			height = Defaults.BAR_HEIGHT,
			labelFontSize = Defaults.LABEL_FONT_SIZE,
			tooltipFontSize = Defaults.TOOLTIP_FONT_SIZE,
			tooltipSymbol = Defaults.TOOLTIP_SYMBOL,
			activeColors = Defaults.ACTIVE_COLORS,
			minMax = Defaults.MINMAX,
			detailsHidden = Defaults.DETAILS_HIDDEN,
			detailsHeight = labelFontSize + 10,
			enableHover = Defaults.ENABLE_BAR_HOVER,
			enableToggle = Defaults.ENABLE_BAR_TOGGLE,
			dualValue = Defaults.DUAL_VALUE,
			disabled = Defaults.BAR_DISABLED,
			format = Defaults.FORMAT,
			stripeBackgroundColor = Defaults.STRIPE_BACKGROUND_COLOR
		}
	) {
		super(width, height, "bar");
		this._labelFontSize = labelFontSize;
		this._tooltipFontSize = tooltipFontSize;
		this._tooltipSymbol = tooltipSymbol;
		this._activeColors = activeColors;
		this._minMax = minMax;
		this._detailsHidden = detailsHidden;
		this._detailsHeight = detailsHeight;
		this._enableHover = enableHover;
		this._enableToggle = enableToggle;
		this._dualValue = dualValue;
		this._disabled = disabled;
		this._format = format;
		this._stripeBackgroundColor = stripeBackgroundColor;

		this._observable
			.add("leftEnter")
			.add("leftLeave")
			.add("rightEnter")
			.add("rightLeave")
			.add("middleEnter")
			.add("middleLeave")
			.add("disabled");
	}

	_render() {
		if (!this.detailsHidden) {
			this._details = new Details({
				width: this.width,
				height: this.detailsHeight,
				labelFontSize: this.labelFontSize,
				tooltipFontSize: this.tooltipFontSize,
				tooltipSymbol: this.tooltipSymbol,
				activeColors: this.activeColors,
				format: this.format
			});
			this._details.render(this.container.node(), 0, 0);
		}

		this.container.classed(style['hover-enabled'], this.enableHover);

		this._hover = new Hover({
			width: this.width,
			height: this.height,
		});
		this._hover.render(this.container.node(), 0, 0)
			.on("leftEnter", (data) => {
				this._observable.fire("leftEnter", data);
			})
			.on("leftLeave", (data) => {
				this._observable.fire("leftLeave", data);
			})
			.on("rightEnter", (data) => {
				this._observable.fire("rightEnter", data);
			})
			.on("rightLeave", (data) => {
				this._observable.fire("rightLeave", data);
			})
			.on("middleEnter", (data) => {
				this._observable.fire("middleEnter", data);
			})
			.on("middleLeave", (data) => {
				this._observable.fire("middleLeave", data);
			});

		this.container.attr("cursor", this.enableToggle ? "pointer" : "default");

		this.on("click", (data) => {
			if (this.enableToggle) {
				this._disabled = !this._disabled;
				this.container.classed(style["bar-disabled"], this.disabled);
			}
		});
	}

	/**
	 * @param {BarData} data
	 */
	_setData(data) {
		if (this.enableHover) {
			this._hover.setData(data);
		}
		this._disabled = data.disabled;
		console.log(data);
		this.container.classed(style["bar-disabled"], this.disabled);
		this.container.classed(style["bar-highlighted"], data.highlighted);

		const minMax = data.calculateMinMax(this.minMax);
		this._stripes = data.stripes.map((stripe, index) => {
			let colors = this.activeColors;
			if (data.stripes.length > 1) {
				colors = [this.activeColors[index % this.activeColors.length]]
			} else {
				colors = this.activeColors;
			}

			return new Stripe({
				width: this.width,
				activeColors: data.color ? [data.color] : colors,
				dualValue: this.dualValue,
				minMax: minMax,
				backgroundColor: this.stripeBackgroundColor
			})
		});

		const tooltipsData = [];
		data.stripes.forEach((stripeData, index) => {

			const detailsHeight = this.detailsHidden ? 0 : this.detailsHeight;
			this._stripes[index].render(this.container.node(), 0, detailsHeight + 6*index, index);

			this._stripes[index].setData(stripeData);

			let colors = this.activeColors;
			if (data.stripes.length > 1) {
				colors = [this.activeColors[index % this.activeColors.length]]
			} else {
				colors = this.activeColors;
			}

			if (this.dualValue) {
				tooltipsData.push(new TooltipData({
					text: stripeData.left.value,
					symbol: this.tooltipSymbol,
					color: (colors[1] ? colors[1] : colors[0])
				}));
				tooltipsData.push(new TooltipData({
					text: stripeData.right.value,
					symbol: this.tooltipSymbol,
					color: colors[0]
				}));
			} else {
				tooltipsData.push(new TooltipData({
					text: stripeData.value,
					symbol: data.stripes.length > 1 ? this.tooltipSymbol : undefined,
					color: colors[0]
				}));
			}

		});

		if (!this.detailsHidden) {

			this._details.setData(data.details);

			if (typeof data.details.tooltips === 'undefined') {
				this._details.updateTooltipsData(tooltipsData, data.details.getPrecision("max"), data.details.color);
			}

		}
	}

	_clearData() {
		if (!this.detailsHidden) {
			this._details.clearData();
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

	get detailsHidden() {
		return this._detailsHidden;
	}

	get detailsHeight() {
		return this._detailsHeight;
	}

	get enableToggle() {
		return this._enableToggle;
	}

	get enableHover() {
		return this._enableHover;
	}

	get dualValue() {
		return this._dualValue;
	}

	get disabled() {
		return this._disabled;
	}

	get format() {
		return this._format;
	}

	get stripeBackgroundColor() {
		return this._stripeBackgroundColor;
	}
}

export default Bar;
