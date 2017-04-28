import * as d3 from "d3";

/**
 * @class
 * HistogramData representing data for the histogram view
 */
class HistogramData {
	/**
	 * @param {data} data
	 * @param {Object} options
	 */
	constructor(data, options) {
		this._histogramData = this._loadHistogramData(data, options.width);
		this._minMax = this._calculateMinMax(this._histogramData);
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
	 * Returns histogram data
	 * @returns {Array} histogram data
	 */
	getData() {
		return this._histogramData;
	}

	/**
	* @private
	* Returns min max values for given histogramData
	* @param {Array} histogramData
	* @returns {Object} minMax.min
	* @returns {Object} minMax.max
	*/
	_calculateMinMax(histogramData) {
		var min = d3.min(histogramData, function (d) { return d.value; });
		var max = d3.max(histogramData, function (d) { return d.value; });

		return {
			min: min,
			max: max
		}
	}

	/**
	* Returns value ratio between bars and data
	* @return {Number} value ratio 
	*/
	getValueRatio() {
		var range = this._minMax.max - this._minMax.min;
		return range / this._options.width;
	}

	/**
	 * Returns precision (number of floating digits) for given number
	 */
	getPrecision() {
		var num = this._minMax.min;
		var numParts = num.toString().split(".");
		if (numParts.length > 1) {
			return numParts[1].length;
		} else {
			return 0;
		}
	}

	/**
	 * Returns data value from given position 
	 * @param {Number} position
	 */
	positionToValue(position) {
		var valueRatio = this.getValueRatio();
		var minMax = this.getMinMax();
		return position * valueRatio + minMax.min;
	}

	/**
	 * Returns position from given data value 
	 * @param {Number} value
	 */
	valueToPosition(value) {
		var valueRatio = this.getValueRatio();
		var minMax = this.getMinMax();
		return value / valueRatio - minMax.min / valueRatio;
	}

	/** 
	* @private
	* @param {Array} buckets
	* @param {int} numOfBarsPerBucket - number of bars per column\
	* @returns {Array} data from given buckets 
	*/
	_loadHistogramData(data, width) {
		var histogramData = [];
		var numOfBarsPerBucket = width / data.length;
		data.forEach((bucket) => {
			var step = (bucket.max - bucket.min) / numOfBarsPerBucket;
			d3.range(bucket.min, bucket.max, step).forEach((value) => {
				histogramData.push({
					value: value,
					volume: bucket.content[0].frequency
				});
			});
		});
		return histogramData;
	}
}

export { HistogramData };