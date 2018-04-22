
export default class BarData {

	constructor(
		{
			disabled,
			highlighted
		},
		detailsData,
		stripesData
	) {
		if (typeof stripesData === 'undefined') throw "stripesData is required parameter";

		this._disabled = disabled;
		this._highlighted = highlighted;
		this._detailsData = detailsData;
		this._stripesData = stripesData;
	}

	/**
	 * @param {BarData} barData
	 */
	static copyAs(barData) {
		return new BarData(
			{
				disabled: barData.disabled,
				highlighted: barData.highlighted
			},
			barData.details,
			barData.stripes
		);
	}

	get disabled() {
		return this._disabled;
	}
	set disabled(disabled) {
		this._disabled = disabled;
	}

	get highlighted() {
		return this._highlighted;
	}
	set highlighted(highlighted) {
		this._highlighted = highlighted;
	}

	get details() {
		return this._detailsData;
	}
	set details(detailsData) {
		this._detailsData = detailsData;
	}

	get stripes() {
		return this._stripesData;
	}
	getStripe(index) {
		return this._stripesData[index];
	}
	setStripe(index, stripeData) {
		this._stripesData[index] = stripeData;
	}

	calculateMinMax(minMax = "sum") {

		if (minMax === "sum") {

			let containsNegativeVal = false;
			let containsPositiveVal = false;
			const absMax = this.stripes.reduce((sum, stripe) => {
				const min = stripe.calculateMinMax(minMax).min;
				const max = stripe.calculateMinMax(minMax).max;
				if (min < 0) containsNegativeVal = true;
				if (max > 0) containsPositiveVal = true;
				return sum + Math.max(Math.abs(min), Math.abs(max))
			}, 0);

			return {
				min: containsNegativeVal ? -absMax : 0,
				max: containsPositiveVal ? absMax : 0
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