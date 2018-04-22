export default class BarchartData {

	constructor(
		{
			color
		},
		detailsData,
		barsData
	) {
		if (typeof barsData === 'undefined') throw "barsData is required parameter";

		this._color = color;
		this._detailsData = detailsData;
		this._barsData = barsData;
	}

	get details() {
		return this._detailsData;
	}

	get bars() {
		return this._barsData;
	}

	get color() {
		return this._color;
	}

	calculateMinMax(minMax = "sum") {

		if (minMax === "sum") {

			return {
				min: 0,
				max: this.bars.reduce((sum, bar) => sum + bar.calculateMinMax(minMax).max, 0)
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