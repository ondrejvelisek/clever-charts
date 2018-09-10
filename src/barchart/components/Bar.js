import * as Defaults from "../defaults/BarchartDefaults";
import Component from "./Component";
import Details from "./Details";
import Stripe from "./Stripe";
import style from "../Barchart.css";
import DetailsData from "../data/DetailsData";

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

		this._details;
		this._stripes;

		this._observable
			.add("disabled");
	}

	_render() {
		if (!this.detailsHidden) {
			this._createDetails();
			this._renderDetails();
		}

		this.container.classed(style['hover-enabled'], this.enableHover);

		if (this.enableToggle) {
			this._doEnableToggle();
		}
	}

	/**
	 * @param {BarData} data
	 */
	_setData(data) {
		this._disabled = data.disabled;
		this.container.classed(style["bar-disabled"], this.disabled);
		this.container.classed(style["bar-highlighted"], data.highlighted);

		this._setDetailsData(data.details);

		this._createStripes(data);
		this._renderStripes();
		this._setStripesData(data);
	}

	_clearData() {
		if (!this.detailsHidden) {
			this._details.clearData();
		}
	}

	_createDetails() {
		this._details = new Details({
			width: this.width,
			height: this.detailsHeight,
			labelFontSize: this.labelFontSize,
			tooltipFontSize: this.tooltipFontSize,
			tooltipSymbol: this.tooltipSymbol,
			activeColors: this.activeColors,
			format: this.format
		});
	}

	_renderDetails() {
		this._details.render(this.container.node(), 0, 0);
	}

	_setDetailsData(detailsData) {
		if (this.details) {
			const detailsDataDefault = DetailsData.copyAs(detailsData);
			this.details.setData(detailsDataDefault);
		}
	}

	_createStripes(data) {
		const minMax = data.calculateMinMax(this.minMax);
		this._stripes = data.stripes.map((stripe, index) => {
			let colors;
			if (data.stripes.length > 1) {
				colors = [this.activeColors[index % this.activeColors.length]]
			} else {
				colors = this.activeColors.slice();
			}

			return new Stripe({
				width: this.width,
				activeColors: colors,
				dualValue: this.dualValue,
				minMax: minMax,
				backgroundColor: this.stripeBackgroundColor,
				topCornerRounded: index === 0,
				bottomCornerRounded: index === data.stripes.length-1,
				condensed: this.detailsHidden
			})
		});
	}

	_renderStripes() {
		const detailsHeight = this.detailsHidden ? 0 : this.detailsHeight;
		this.stripes.forEach((stripe, index) => {
			stripe.render(this.container.node(), 0, detailsHeight + 5 * index, index);
		});
	}

	_setStripesData(data) {
		data.stripes.forEach((stripeData, index) => this.stripes[index].setData(stripeData));
	}

	_doEnableToggle() {
		this.container.attr("cursor", "pointer");
		this.on("click", (index) => {
			this._disabled = !this._disabled;
			this.container.classed(style["bar-disabled"], this.disabled);
			this._observable.fire("disabled", index, this._disabled);
		});
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


	get stripes() {
		return this._stripes;
	}

	get details() {
		return this._details;
	}

}

export default Bar;
