import * as d3 from "d3";
import style from "../Histogram.css";
import Observable from "../utils/Observable";

/**
 * Gradient index shared for all instances
 */
var gradientIndex = 0;

/**
 * @class
 * HistogramHandle representing control handle for histogram
 */
export default class HistogramHandle {
	/**
	 * @param {D3Selection} groupEl
	 * @param {Number} value
	 * @param {Number} index
	 * @param {HistoryData} histogramData
	 * @param {Object} options
	 */
	constructor(groupEl, value, index, histogramData, options) {
		/**
		 * @private
		 * observable handler
		 */
		this._observable = new Observable([
			/**
			 * @event 
			 * Fires when mouse is over a selection
			 * @param {int} selectionIndex
			 */
			"drag",
			/**
			 * @event 
			 * Fires when drag on handle starts
			 * @param {HistogramHandle} handle
			 */
			"startDrag",
			/**
			 * @event 
			 * Fires when drag on handle ends
			 * @param {HistogramHandle} handle
			 */
			"endDrag"
		]);

		/**
		 * @private
		 * handle element
		 */
		this._handleEl = null;
		
		/**
		 * @private
		 * handle line element
		 */
		this._handleLineEl = null;

		/**
		 * @private
		 * handle circle element
		 */
		this._handleCircleEl = null;

		/**
		 * @private
		 * handle mask element
		 */
		this._handleMaskEl = null;

		/**
		 * @private
		 * handle mask gradient element
		 */
		this._handleMaskGradientEl = null;		

		/**
		 * @private
		 * handle label element
		 */
		this._handleLabelEl = null;		

		/**
		 * @private 
		 * True if handle is over
		 */
		this._isOver = false;
		
		/**
		 * @private 
		 * Main group element
		 */		
		this._groupEl = groupEl;
		/**
		 * @private 
		 * handle index
		 */		
		this._index = index;
		/**
		 * @private 
		 * handle value
		 */		
		this._value = value;
		/**
		 * @private 
		 * handle position
		 */		
		this._position = histogramData.valueToPosition(value);
		/**
		 * @private 
		 * bar options
		 */		
		this._options = options;
		/**
		 * @private 
		 * histogram data
		 */		
		this._histogramData = histogramData;

		/**
		 * @private 
		 * elements
		 */		
		this._elements = [];		
		
		this._renderHandle();
	}

	/**
	 * @public
	 * Destroys this handle
	 */
	destroy(){
		this._elements.forEach(element=>element.remove());
		this._elements = [];
	}

	/**
	 * @private
	   * Renders drag handle
	   */
	_renderHandle() {
		this._elements = [
			this._createHandleElement(),
			this._createHandleLineElement(),
			this._createHandleCircleElement(),
			this._createDragMaskElement(),
			this._createMaskGradientElement(),
			this._createDragLabelElement()
		];

		this._handleHoverState();
		this._handleDrag();
	}	

	hide(){
		this._elements.forEach(element=>element.attr("visibility", "hidden"));
	}

	/**
	 * @public
	 * Bind handle event
	 * @param {String} event event name
	 * @param {Function} handler event handler
	 * @returns {HistogramHandle} returns this handle instance
	 */
	on(eventName, handler) {
		this._observable.on(eventName, handler);
		return this;
	}

	/**
	 * @public
	 * Returns X position of this handle
	 * @returns {Number} X position handle
	 */
	getXPosition() {
		return parseInt(this._handleEl.attr("x"))+5;
	}

	/**
	 * @public
	 * Sets hover state
	 */
	setHoverState(){
		this._handleLineEl.attr("fill-opacity", 1);
		this._handleLabelEl.attr("fill-opacity", 1);
		this._handleMaskEl.attr("display", "block");
		this._handleCircleEl.attr("stroke-width", 3);
	}
	
	/**
	 * @public 
	 * @returns {SVGRect} 
	 * Returns drag label box for this handle
	 */
	getLabelBox(){
		return this._handleLabelEl.node().getBBox();
	}

	/**
	 * @public 
	 * Shifts handle label by given offset so it can handle label position conflicts
	 */
	setLabelOffset(offset){
		this._handleLabelEl.attr("transform", "translate("+offset+", 0)")
		this._handleMaskEl.attr("transform", "translate("+offset+", 0)")
	}

	/**
	 * @public 
	 * Sets handle position
	 */
	setHandleXPosition(position){
		this._handleCircleEl.attr("transform", "translate("+position+", "+this._options.height+")")
	}

	/**
	 * @public
	 * Unsets hover state
	 */
	unsetHoverState(){
		this._handleLineEl.attr("fill-opacity", 0);
		this._handleLabelEl.attr("fill-opacity", 0);
		this._handleMaskEl.attr("display", "none");
		this._handleCircleEl.attr("stroke-width", 1);
		this._handleLabelEl.attr("transform", "translate(0, 0)")
		this._handleMaskEl.attr("transform", "translate(0, 0)")
	}

	/**
	 * @public
	 * Enables this handle 
	 */
	enable(){
		this._elements.forEach(element => element.attr("pointer-events", "all"));
	}

	/**
	 * @public
	 * Disables this handle 
	 */
	disable(){
		this._elements.forEach(element => element.attr("pointer-events", "none"));
	}

	/**
	 * @private
	 * Handle hover state
	 */
	_handleHoverState(){
		// line hover effect
		this._handleEl.on("mouseover", () => {
			this._isOver = true;
			this.setHoverState();
		})
		this._handleEl.on("mouseout", () => {
			this._isOver = false;
			this.unsetHoverState();
		})
	}

	/**
	 * @private
	 * handles what happens when drag starts
	 */
	_onStartDrag(){
		this._groupEl.classed(style["dragging"], true);
		this._observable.fire("startDrag", this);
	}

	/**
	 * @private
	 * handles what happens on drag
	 */
	_onDrag(){
		var width = this._options.width;
		var height = this._options.height;
		var xpos = Math.round(Math.max(Math.min(d3.event.x, width), 0));
		var format = this._options.format;

		this._handleEl.attr("x", xpos - 5);
		this._handleLineEl.attr("x", xpos - 2);
		this._handleCircleEl.attr("transform", "translate(" + xpos + "," + height + ")");
		this._handleEl.attr("data-handle-value", this._histogramData.positionToValue(xpos))

		this.setHoverState();

		this._handleLabelEl.text(() => {
			return format(this._histogramData.positionToValue(xpos));
		})

		this._updateLabelPosition(xpos);
		this._observable.fire("drag");		
	}	

	/**
	 * @private
	 * handles what happens when drag ends
	 */
	_onEndDrag(){
		this._groupEl.classed(style["dragging"], false);
		if (!this._isOver) {
			this.unsetHoverState();
		}

		this._observable.fire("endDrag", this);		
	}

	/**
	 * @private
	 * Handles handle drag 
	 */
	_handleDrag(){
		this._handleEl.call(d3.drag()
			.on("drag", this._onDrag.bind(this))
			.on("start", this._onStartDrag.bind(this))
			.on("end", this._onEndDrag.bind(this)));
	}

	/**
	 * @private
	 * Updates label position
	 * @param {Number} position 
	 */
	_updateLabelPosition(position) {
		var label = this._handleLabelEl.node();
		var maskPadding = this._options.maskPadding;		

		// we need to calculate text length so we can create mask and center text
		var textLength = label.getComputedTextLength();
		var maskWidth = textLength + maskPadding * 2;
		var xPosition = position - textLength / 2;

		// handle when dragging towards left side
		if (xPosition < 0) {
			xPosition = 0;
		}

		// handle when dragging towards right side
		if (xPosition + textLength > this._options.width) {
			xPosition = this._options.width  - textLength;
			this._handleLabelEl.attr("x", this._options.width);
			this._handleLabelEl.attr("text-anchor", "end");
		} else {
			this._handleLabelEl.attr("x", xPosition);
			this._handleLabelEl.attr("text-anchor", "start");
		}

		// position mask
		this._handleMaskEl.attr("x", () => {
			return parseInt(xPosition) - maskPadding;
		});

		this._handleMaskGradientEl.attr("x1", xPosition - maskPadding);
		this._handleMaskGradientEl.attr("x2", xPosition + maskWidth - maskPadding);

		this._handleMaskEl.attr("width", maskWidth);
		this._handleMaskEl.attr("height", 20);
	}
		
	/**
	 * Creates mask gradient element
	 * @param {Number} handleIndex 
	 */
	_createMaskGradientElement(){
		this._handleMaskGradientEl = this._groupEl.append("linearGradient")
			.attr("id", "brush-mask-gradient-" + gradientIndex++)
			.attr("gradientUnits", "userSpaceOnUse")
			.attr("y1", 0).attr("x1", 50)
			.attr("y2", 0).attr("x2", 0);

		this._handleMaskGradientEl.selectAll("stop")
			.data([
				{ offset: "0%", color: "rgba(255,255,255,0)" },
				{ offset: "20%", color: "rgba(255,255,255,1)" },
				{ offset: "80%", color: "rgba(255,255,255,1)" },
				{ offset: "100%", color: "rgba(255,255,255,0)" }
			])
			.enter().append("stop")
			.attr("offset", function (d) { return d.offset; })
			.attr("stop-color", function (d) { return d.color; });

		return this._handleMaskGradientEl;
	}

	/**
	 * @private 
	 * Renders main handle element 
	 * @returns {SVGElement}
	 */
	_createHandleElement(){
		this._handleEl = this._groupEl.append("rect")
			.attr("class", style["custom-handle"])
			.attr("fill-opacity", 0)
			.attr("data-handle-index", this._index)
			.attr("data-handle-value", this._value)
			.attr("cursor", "ew-resize")
			.attr("width", 10)
			.attr("height", this._options.height + 5)
			.attr("x", this._position - 5);

		return this._handleEl;
	}

	/**
	 * @private 
	 * Renders handle line element 
	 * @returns {SVGElement} 
	 */
	_createHandleLineElement(){
		this._handleLineEl = this._groupEl.append("rect")
			.attr("class", style["custom-handle-line"])
			.attr("width", 4)
			.attr("height", this._options.height)
			.attr("fill-opacity", 0)
			.attr("x", this._position - 2);

		return this._handleLineEl;
	}	

	/**
	 * @private 
	 * Renders handle circle element 
	 * @returns {SVGElement} 
	 */
	_createHandleCircleElement(){
		this._handleCircleEl = this._groupEl.append("circle")
			.attr("class", style["custom-handle-circle"])
			.attr("transform", "translate(" + this._position + "," + this._options.height + ")")
			.attr("fill", "#ffffff")
			.attr("fill-opacity", 1)
			.attr("stroke", "#000")
			.attr("stroke-width", 1)
			.attr("cursor", "ew-resize")
			.attr("r", 3.5);

		return this._handleCircleEl;
	}		

	/**
	 * @private 
	 * Renders drag mask element 
	 * @returns {SVGElement} 
	 */
	_createDragMaskElement(){
		this._handleMaskEl = this._groupEl.append("rect")
			.attr("class", style["drag-label-mask"])
			.attr("fill", "url(#brush-mask-gradient-" + gradientIndex+")")
			.attr("y", this._options.height + 12)
			.attr("display", "none");			

		return this._handleMaskEl;
	}
	
	/**
	 * @private 
	 * Renders handle label element 
	 * @returns {SVGElement}  
	 */
	_createDragLabelElement(){
		var format = this._options.format;
		var data = this._histogramData;
		var height = this._options.height;
		this._handleLabelEl = this._groupEl.append("text")
			.attr("class", style["drag-label"])
			.attr("fill-opacity", 0)
			.text(() => {
				return format(data.positionToValue(this._position));
			}).attr("y", height + 22);

		
		this._updateLabelPosition(this._position);
		return this._handleLabelEl;
	}
}