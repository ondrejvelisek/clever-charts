import HistogramSelection from "./HistogramSelection";
import {SelectionTypes} from "./HistogramSelection";
import * as Defaults from "../HistogramDefaults";

/**
 * @class
 * MultipleHistogramSelection representing histogram selection that support multiple selections
 */
export default class MultipleHistogramSelection extends HistogramSelection{
	/**
	 * @param {HistogramData} histogramData
	 * @param {Array} selection
	 */
    constructor(histogramData, selection) {
		super();
		this._selection = selection.slice();
    }

	/**
	 * @public
	 * @implements HistogramSelection.getSelectionType()
	 * Returns histogram selection
	 */
	getSelectionType(){
		return SelectionTypes.MULTI;
	}

	/**
	 * @public
	 * @implements HistogramSelection.getSelection()
	 * Returns histogram selection
	 */
	getSelection(){
		return this._selection;
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
	 * @implements HistogramSelection.allowsToggle()
	 * Returns true if selection allows toggle
	 */
	allowsToggle(){
		return true;
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