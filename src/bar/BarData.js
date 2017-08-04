import * as d3 from "d3";

/**
 * @class
 * BarData representing data for the bar
 */
export default class BarData {
	/**
	 * @param {data} data
	 * @param {Object} options
	 */
	constructor(data, options) {
		this._barData = this._loadBarData(data, options);
		this._minMax = this._calculateMinMax(this._barData);
		this._options = options;
	}

	/**
	 * @public
	 * Returns min max of history data
	 * @returns {Object} minMax
	 * @returns {Number} minMax.min
	 * @returns {Number} minMax.max
	 */
	getMinMax() {
		return this._minMax;
	}

	/**
	 * @public
	 * Returns histogram data
	 * @returns {Array} histogram data
	 */
	getData() {
		return this._barData;
	}

	/**
	* @private
	* Returns min max values for given BarData
	* @param {Array} BarData
	* @returns {Object} minMax.min
	* @returns {Object} minMax.max
	*/
	_calculateMinMax(barData) {
		var max = d3.sum(barData, function (d) { return d.value; });

		return {
			min: 0,
			max: max
		}
	}

	/**
	 * @public
	 * Returns precision (number of floating digits) for given number
	 */
	getPrecision() {
		var num = this._minMax.max;
		var numParts = num.toString().split(".");
		if (numParts.length > 1) {
			return numParts[1].length;
		} else {
			return 0;
		}
	}

	/** 
	* @private
	* @param {Array} data
	* @returns {Array} bar data
	*/
	_loadBarData(data) {
		// no transofrmation at this stage
		return data.slice();
	}
}