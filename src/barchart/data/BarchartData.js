export default class BarchartData {

	constructor(
		_,
		detailsData,
		barsData
	) {
		if (typeof barsData === 'undefined') throw "barsData is required parameter";

		this._detailsData = detailsData;
		this._barsData = barsData;
	}

	/**
	 * @param {BarchartData} barchartData
	 */
	static copyAs(barchartData) {
		return new BarchartData(
			{},
			barchartData.details,
			barchartData.bars
		);
	}

	get details() {
		return this._detailsData;
	}
	set details(detailsData) {
		this._detailsData = detailsData;
	}

	get bars() {
		return this._barsData;
	}
	getBar(index) {
		return this._barsData[index];
	}
	setBar(index, barData) {
		this._barsData[index] = barData;
	}

	calculateMinMax(minMax = "sum") {

		if (minMax === "sum") {

			let containsNegativeVal = false;
			let containsPositiveVal = false;
			const sum = this.bars.reduce((sum, bar) => {
				const min = bar.calculateMinMax(minMax).min;
				const max = bar.calculateMinMax(minMax).max;
				if (min < 0) containsNegativeVal = true;
				if (max > 0) containsPositiveVal = true;
				return sum + Math.max(Math.abs(min), Math.abs(max));
			}, 0);

			return {
				min: containsNegativeVal ? -sum : 0,
				max: containsPositiveVal ? sum : 0
			}

		} else if (minMax === "auto") {

			return {
				min: this.bars.reduce((min, bar) => Math.min(min, bar.calculateMinMax(minMax).min), 0),
				max: this.bars.reduce((max, bar) => Math.max(max, bar.calculateMinMax(minMax).max), 0)
			}

		} else {
			return minMax;
		}

	}

	getPrecision(precision = "max") {
		if (precision === "max") {
			return this.bars.reduce((max, bar) => Math.max(max, bar.getPrecision(precision)), 0)
		} else {
			return precision;
		}
	}

}