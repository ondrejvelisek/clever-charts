/**
 * @interface
 * HistogramSelection interface
 */
export default class HistogramSelection {
	/**
	 * @public
	 * @returns {Array} histogram selection
	 * Returns histogram selection
	 */
	getSelection(){
		throw "HistogramSelection.getSelection() has to be implemented";
	}

	/**
	 * @public
	 * @returns {Array} histogram selection
	 * Returns histogram selection 
	 */
	getOutputSelection(){
		throw "HistogramSelection.getOutputSelection() has to be implemented";
	}

	/**
	 * @public 
	 * @returns {String}
	 * Returns histogram selection type
	 */
	getSelectionType(){
		throw "HistogramSelection.getSelectionType() has to be implemented";
	}

	/**
	 * @public 
	 * @returns {Boolean}
	 * Returns true if toogle is allowed
	 */
	allowsToggle(){
		throw "HistogramSelection.allowsToogle() has to be implemented";
	}	

	/**
	 * @public 
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