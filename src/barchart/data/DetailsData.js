export default class DetailsData {

	constructor(
		{
			label,
			color,
			tooltips,
			disabled
		}
	) {
		if (typeof label === 'undefined') throw "label is required parameter";
		this._data = {
			label,
			color,
			tooltips,
			disabled
		};
	}

	get label() {
		return this._data.label;
	}

	get tooltips() {
		return this._data.tooltips;
	}

	get color() {
		return this._data.color;
	}

	get disabled() {
		return this._data.disabled;
	}

	getPrecision(precision = "max") {
		if (precision === "max") {
			if (!this.tooltips) {
				return 0;
			}
			return this.tooltips.reduce((max, tooltip) => Math.max(max, tooltip.getPrecision()), 0);
		} else {
			return precision;
		}
	}

}