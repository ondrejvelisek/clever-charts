import * as Defaults from "../defaults/BarchartDefaults";
import TooltipData from "./TooltipData";

export default class BarData {

	constructor(
		{
			disabled = Defaults.BAR_DISABLED,
			highlighted = Defaults.BAR_HIGHLIGHTED,
			color
		},
		detailsData,
		stripesData
	) {
		if (typeof stripesData === 'undefined') throw "stripesData is required parameter";

		this._disabled = disabled;
		this._highlighted = highlighted;
		this._detailsData = detailsData;
		this._stripesData = stripesData;
		this._color = color;
	}

	get disabled() {
		return this._disabled;
	}

	get highlighted() {
		return this._highlighted;
	}

	get details() {
		return this._detailsData;
	}

	get stripes() {
		return this._stripesData;
	}

	get color() {
		return this._color;
	}

	calculateMinMax(minMax = "sum") {

		if (minMax === "sum") {

			return {
				min: 0,
				max: this.stripes.reduce((sum, stripe) => sum + stripe.calculateMinMax(minMax).max, 0)
			}

		} else if (minMax === "auto") {

			return {
				min: this.stripes.reduce((min, stripe) => Math.min(min, stripe.calculateMinMax(minMax).min), 0),
				max: this.stripes.reduce((max, stripe) => Math.max(max, stripe.calculateMinMax(minMax).max), 0)
			}

		} else {
			return minMax;
		}

	}

	getPrecision(precision = "max") {
		if (typeof this.details === 'undefined') {
			return 0;
		}
		if (this.details === null) {
			return 0;
		}
		return this.details.getPrecision(precision);
	}

}