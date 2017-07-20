/**
 * @abstract
 * abstract HistogramSelection class
 */
export default class HistogramSelection {
	constructor(histogramData, selection){
		this._selection = selection.map(s=>{
			return Object.assign(s, {
				position:{
					from:histogramData.valueToPosition(s.from),
					to:histogramData.valueToPosition(s.to)
				}
			});
		});
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
	 * @abstract
	 * @returns {Array} histogram selection
	 * Returns histogram selection 
	 */
	getOutputSelection(){
		throw "HistogramSelection.getOutputSelection() has to be implemented";
	}

	/**
	 * @public 
	 * @abstract
	 * @returns {String}
	 * Returns histogram selection type
	 */
	getSelectionType(){
		throw "HistogramSelection.getSelectionType() has to be implemented";
	}

	/**
	 * @abstract
	 * @public 
	 * @returns {Boolean}
	 * Returns true if toogle is allowed
	 */
	allowsToggle(){
		throw "HistogramSelection.allowsToogle() has to be implemented";
	}	

	/**
	 * @public
	 * @abstract 
	 * @returns {Array}
	 * Returns histogram selection points
	 */
	getSelectionPoints(){
		throw "HistogramSelection.getSelection() has to be implemented";
	}  	
}

var SelectionTypes = {
	MULTI:"multi",
	FILTER:"filter",
	INVERTED_FILTER:"inverted-filter"
}

export {SelectionTypes} 