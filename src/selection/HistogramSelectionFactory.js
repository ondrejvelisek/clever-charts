import DefaultHistogramSelectionImpl from "./DefaultHistogramSelectionImpl";
import MultipleHistogramSelectionImpl from "./MultipleHistogramSelectionImpl";
import FilterHistogramSelectionImpl from "./FilterHistogramSelectionImpl";
import InvertedFilterHistogramSelectionImpl from "./InvertedFilterHistogramSelectionImpl";
import {SelectionTypes} from "./HistogramSelection";

/**
 * @class
 * HistogramSelection factory returns appropriate selection implementation
 */
export default class HistogramSelectionFactory {
	/**
	 * @param {Object} options
	 */
	constructor(options) {
		this._options = options;
	}

	/**
	 * @public
	 * @param {HistogramData} histogramData
	 * @returns {HistogramSelection} returns histogram selection
	 * Returns histogram selection
	 */
	getHistogramSelection(selection, histogramData){		
		// use default histogram selection if selection is not provided
		if (!selection){
			return new DefaultHistogramSelectionImpl(histogramData, this._options.selection);
		} else if (this._options.selectionType == SelectionTypes.FILTER){
			return new FilterHistogramSelectionImpl(histogramData, selection);
		} else if (this._options.selectionType == SelectionTypes.INVERTED_FILTER){
			return new InvertedFilterHistogramSelectionImpl(histogramData, selection);
		} else {
			return new MultipleHistogramSelectionImpl(histogramData, selection);
		}
	}  	
}