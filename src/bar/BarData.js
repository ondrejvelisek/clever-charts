import * as d3 from "d3";

/**
 * @class
 * series representing data for the line
 */
export default class BarData {
	/**
	 * @param {Array} series
	 * @param {Object} options
	 */
	constructor(series, options) {
		this._options = options;
		this._series = series.slice();
		this._minMax = this._calculateMinMax(this._series);
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
	 * Returns line series
	 * @returns {Array} line series
	 */
	getSeries() {
		return this._series;
	}

	/**
	 * @public
	 * Returns all data from all series merged into one array
	 * @returns {Array}
	 */
	getAllData() {
		return [].concat.apply([], this._series);
	}

	/**
	 * Returns merged data where each unique label has an array of values
	 */
	getMergedData() {
		var dataMap = {};
		this.getAllData().forEach((item=>{
			const result = dataMap[item.label] || {
				label:item.label,
				values:[],
				disabled:item.disabled,
				highlighted:item.highlighted,
				colors:[],
				tooltips:[]
			};
			result.values.push(item.value);
			result.tooltips.push(item.tooltip);
			result.colors.push(item.color);
			dataMap[item.label] = result;
		}));

		return Object.values(dataMap);
	}

	/**
	* @private
	* Returns min max values for given series
	* @param {Array} series
	* @returns {Object} minMax.min
	* @returns {Object} minMax.max
	*/
	_calculateMinMax(series) {
		let data = [].concat.apply([], series);
		if (this._options.minMax == "sum"){
			let sums = this._series.map((data)=>{
				return d3.sum(data, function (d) { return d.value; });
			});
			return {
				min:0,
				max:Math.max.apply(Math, sums)
			}
		} else {
			let min = d3.min(data, function (d) { return d.value; });
			let max = d3.max(data, function (d) { return d.value; });
	
			if (data.length <= series.length) {
				min = Math.min(min, 0);
				max = Math.max(max, 0);
			}
	
			return {
				min: min,
				max: max
			}
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
}