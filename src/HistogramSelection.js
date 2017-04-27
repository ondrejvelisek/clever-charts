/**
 * @class
 * HistogramSelection representing histogram selection
 */
class HistogramSelection {
	/**
	 * @param {Array} selection
	 */
    constructor(selection) {
		this._selection = selection.slice();
    }

	/**
	 * @public
	 * Returns histogram selection
	 */
	getSelection(){
		return this._selection;
	}

	/**
	 * @public 
	 * Returns histogram selection points
	 */
	getSelectionPoints(){
		var result = [];
		var selection = this.getSelection();
		selection.forEach((s, index)=>{
			result.push(s.from);
			if (index == selection.length-1){
				result.push(s.to);
			}
		});

		return result;
	}  	
}

export {HistogramSelection};