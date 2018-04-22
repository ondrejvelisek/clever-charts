import Observable from "../../utils/Observable";
import Barchart from "./Barchart";
import TooltipData from "../data/TooltipData";
import StripeData from "../data/StripeData";
import BarData from "../data/BarData";
import DetailsData from "../data/DetailsData";
import BarchartData from "../data/BarchartData";

class BarchartBackport {

	constructor(
		{
			width,
			height,
			labelFontSize,
			valueFontSize, // deprecated: use tooltipFontSize
			tooltipFontSize = valueFontSize,
			tooltipSymbol,
			activeBarColor, // deprecated: use activeColors
			activeBarColors = activeBarColor ? [activeBarColor] : undefined, // deprecated: use activeColors
			activeColors = activeBarColors,
			inactiveBarColor, // deprecated: use stripeBackgroundColor
			stripeBackgroundColor = inactiveBarColor,
			minMax,
			detailsVisible,
			detailsHeight,
			dualValue,
			barHeight,
			enableBarHover,
			enableBarToggle,
			format
		}
	) {
		this._observable = new Observable([]);
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
			.add("barDisabled");

		// deprecated: use barEnter and barLeave
		this._observable
			.add("barOver")
			.add("barOut");

		this._barchart = new Barchart({
			width,
			height,
			labelFontSize,
			tooltipFontSize,
			tooltipSymbol,
			activeColors,
			stripeBackgroundColor,
			minMax,
			detailsVisible,
			detailsHeight,
			dualValue,
			barHeight,
			enableBarHover,
			enableBarToggle,
			format
		});

		this._barchart.on("barEnter", barIndex => {
			this._observable.fire("barEnter", barIndex);
			this._observable.fire("barOver", barIndex);
		});

		this._barchart.on("barLeave", barIndex => {
			this._observable.fire("barLeave", barIndex);
			this._observable.fire("barOut", barIndex);
		});

		this._barchart.on("barLeftEnter", barIndex => {
			this._observable.fire("barLeftEnter", barIndex);
		});
		this._barchart.on("barLeftLeave", barIndex => {
			this._observable.fire("barLeftLeave", barIndex);
		});

		this._barchart.on("barMiddleEnter", barIndex => {
			this._observable.fire("barMiddleEnter", barIndex);
		});
		this._barchart.on("barMiddleLeave", barIndex => {
			this._observable.fire("barMiddleLeave", barIndex);
		});

		this._barchart.on("barRightEnter", barIndex => {
			this._observable.fire("barRightEnter", barIndex);
		});
		this._barchart.on("barRightLeave", barIndex => {
			this._observable.fire("barRightLeave", barIndex);
		});

		this._barchart.on("barClick", barIndex => {
			this._observable.fire("barClick", barIndex);
		});
		this._barchart.on("barDisabled", barIndex => {
			this._observable.fire("barDisabled", barIndex);
		});
	}

	on(eventName, handler) {
		this._observable.on(eventName, handler);
		return this;
	}

	off(eventName, handler) {
		this._observable.off(eventName, handler);
		return this;
	}

	destroy() {
		this._observable.destroy();
		this._barchart.destroy();
		return this;
	}

	render(selector, x = 0, y = 0) {
		this._barchart.render(selector, x, y);
		return this;
	}

	setData(...series) {
		if (!this._barchart.isRendered()) {
			throw "Can't call setData() when widget is not rendered, please call .render() first."
		}

		const bars = {};

		series.forEach((serie) => {
			serie.forEach((data) => {

				if (typeof bars[data.label] === 'undefined') {
					bars[data.label] = {}
					bars[data.label].values = [];
				}

				bars[data.label].label = data.label;
				bars[data.label].disabled = bars[data.label].disabled || data.disabled;
				bars[data.label].highlighted = bars[data.label].highlighted || data.highlighted;
				bars[data.label].values.push({
					value: data.value,
					color: data.color,
					tooltip: data.tooltip
				});

			})
		});

		const barsData = [];

		for(const barLabel in bars) {
			const bar = bars[barLabel];

			const values = [];
			let tooltips;
			for(const index in bar.values) {
				const value = bar.values[index];

				values.push(new StripeData({
					value: value.value,
					color: value.color
				}));

				if (typeof value.tooltip !== 'undefined') {
					if (typeof tooltips === 'undefined') {
						tooltips = [];
					}
					tooltips.push(new TooltipData({
						text: value.tooltip,
						color: value.color
					}));
				}

			}

			barsData.push(new BarData(
				{
					disabled: bar.disabled,
					highlighted: bar.highlighted
				},
				new DetailsData({
					label: barLabel,
					tooltips: tooltips
				}),
				values
			));
		}

		this._barchart.setData(new BarchartData({}, null, barsData));

		return this;
	}


}

export default BarchartBackport;
