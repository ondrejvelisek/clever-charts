export default class DetailsData {

	constructor(
		{
			label,
			disabled
		},
		tooltips
	) {
		if (typeof label === 'undefined') throw "label is required parameter";

		this._label = label;
		this._disabled = disabled;
		this._tooltips = tooltips;
	}

	/**
	 * @param {DetailsData} detailsData
	 */
	static copyAs(detailsData) {
		return new DetailsData(
			{
				label: detailsData.label,
				disabled: detailsData.disabled
			},
			detailsData.tooltips,
		);
	}

	get label() {
		return this._label;
	}
	set label(label) {
		this._label = label;
	}

	get tooltips() {
		return this._tooltips;
	}
	getTooltip(index) {
		return this._tooltips[index];
	}
	addTooltip(tooltipData) {
		if (typeof this._tooltips === 'undefined') {
			this._tooltips = [];
		}
		this._tooltips.push(tooltipData);
	}
	setTooltip(index, tooltipData) {
		this._tooltips[index] = tooltipData;
	}

	get disabled() {
		return this._disabled;
	}
	set disabled(disabled) {
		this._disabled = disabled;
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