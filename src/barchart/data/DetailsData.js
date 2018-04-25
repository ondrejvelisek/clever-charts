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

		this._label = label;
		this._color = color;
		this._tooltips = tooltips;
		this._disabled = disabled;
	}

	/**
	 * @param {DetailsData} detailsData
	 */
	static copyAs(detailsData) {
		return new DetailsData(
			{
				label: detailsData.label,
				color: detailsData.color,
				tooltips: detailsData.tooltips,
				disabled: detailsData.disabled
			}
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
	setTooltip(index, tooltipData) {
		this._tooltips[index] = tooltipData;
	}

	get color() {
		return this._color;
	}
	set color(color) {
		this._color = color;
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