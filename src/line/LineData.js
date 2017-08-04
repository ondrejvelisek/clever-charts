import * as d3 from "d3";

/**
 * @class
 * LineData representing data for the line
 */
export default class LineData {
	/**
	 * @param {data} data
	 * @param {Object} options
	 */
	constructor(data, options) {
		this._lineData = this._loadLineData(data, options);
		this._minMax = this._calculateMinMax(this._lineData);
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
		return this._lineData;
	}

	/**
	* @private
	* Returns min max values for given LineData
	* @param {Array} LineData
	* @returns {Object} minMax.min
	* @returns {Object} minMax.max
	*/
	_calculateMinMax(lineData) {
		var min = d3.min(lineData, function (d) { return d.value; });
		var max = d3.max(lineData, function (d) { return d.value; });

		if (lineData.length==1){
			min = Math.min(min, 0);
			max = Math.max(max, 0);
		}

		return {
			min: min,
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
	* @returns {Array} line data
	*/
	_loadLineData(data) {
		// no transofrmation at this stage
		return data.slice();
	}
}