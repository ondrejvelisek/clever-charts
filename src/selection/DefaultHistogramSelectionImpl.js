import HistogramSelection from "./HistogramSelection";
import MultipleHistogramSelectionImpl from "./MultipleHistogramSelectionImpl";
import * as Defaults from "../HistogramDefaults";

/**
 * @class
 * DefaultHistogramSelectionImpl representing histogram selection
 */
export default class DefaultHistogramSelectionImpl extends MultipleHistogramSelectionImpl {
	/**
	 * @param {HistogramData} histogramData
	 * @param {Array} selection
	 */
    constructor(histogramData) {
		var minMax = histogramData.getMinMax();
		var colors = Defaults.DEFAULT_COLORS;
		var start = minMax.min;
		var step = (minMax.max - minMax.min) / colors.length;
		var selection = colors.map(color=>{
			var from = start;
			var to = start + step;
			start += step;

			return {
				from:from, 
				to:to,
				color:color
			}
		});

		super(histogramData, selection);
    }
}