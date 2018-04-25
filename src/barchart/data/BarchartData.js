import DetailsData from "./DetailsData";
import BarData from "./BarData";

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

	/**
	 * @param {BarchartData} barchartData
	 */
	static copyAs(barchartData) {
		return new BarchartData(
			{
				color: barchartData.color
			},
			barchartData.details,
			barchartData.bars
		);
	}

	get color() {
		return this._color;
	}
	set color(color) {
		this._color = color;
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