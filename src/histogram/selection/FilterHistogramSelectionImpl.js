import HistogramSelection from "./HistogramSelection";
import {SelectionTypes} from "./HistogramSelection";

/**
 * @class
 * MultipleHistogramSelection representing histogram selection that support multiple selections
 */
export default class FilterHistogramSelectionImpl extends HistogramSelection{
	/**
	 * @param {HistogramData} histogramData
	 * @param {Array} selection
	 */
    constructor(histogramData, selection) {
		if (selection.length != 1){
			throw "Filter selection doesn't allow more than one selection"
		}
		super(histogramData, selection);
	}
	/**
	 * @public
	 * @returns {Array} histogram selection
	 * @implements HistogramSelection.getOutputSelection()
	 * Returns histogram selection 
	 */
	getOutputSelection(){
		return this._selection;
	}		

	/**
	 * @public
	 * @implements HistogramSelection.getSelectionType()
	 * Returns histogram selection
	 */
	getSelectionType(){
		return SelectionTypes.FILTER;
	}	

	/**
	 * @public
	 * @implements HistogramSelection.allowsToggle()
	 * Returns true if selection allows toggle
	 */
	allowsToggle(){
		return false;
	}	

	/**
	 * @public 
	 * @implements HistogramSelection.getSelectionPoints()
	 * Returns histogram selection points
	 */
	getSelectionPoints(){
		var result = [];
		var selection = this.getSelection();
		selection.forEach((s, index)=>{
			result.push({
				value:s.from
			});

			if (index == selection.length-1){
				result.push({
					value:s.to
				});
			}
		});

		return result;
	}  	
}