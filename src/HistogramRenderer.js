import style from "./Histogram.css";
import {HistogramHandle} from "./HistogramHandle";
import { Observable } from "./utils/Observable";
import * as PositionUtils from "./utils/PositionUtils"
import * as d3 from "d3";

/**
 * @class
 * Histogram renderer class
 * @param {Object} options
 */
class HistogramRenderer {
    constructor(options) {
		/**
		 * @private 
		 * Histogram options
		 */
		this._options = options;

		/**
		 * @private 
		 * DOM container of this widget
		 */
		this._containerEl = null;

		/**
		 * @private 
		 * Main group element of this widget
		 */
		this._groupEl = null;

		/**
		 * @private 
		 * Main SVG element of this widget
		 */
		this._svgEl = null;

		/**
		 * @private
		 * Bar data 
		 */
		this._historyData = null;

		/**
		 * @private
		 * X axis
		 */
		this._xAxis = d3.scaleBand().range([0, options.width]);

		/**
		 * @private
		 * Y axis
		 */
		this._yAxis = d3.scaleLinear().range([options.height, 0]);

		/**
		 * @private
		 * index of over selection  
		 */
		this._overSelectionIndex = null;

		/**
		 * @private
		 * true if histogram has been rendered
		 */
		this._rendered = false;

		/**
		 * @private
		 * true if handle is dragged
		 */
		this._draggingHandle = false;		

		/**
		 * @private
		 * observable handler
		 */
		this._observable = new Observable([
			/**
			 * @event 
			 * Fires when mouse is over a category
			 * @param {int} selectionIndex
			 */
			"selectionOver",
			/**
			 * @event 
			 * Fires when selection is toggled
			 * @param {int} selectionIndex
			 * @param {bool} enabled
			 */
			"toggleSelection",
			/**
			 * @event 
			 * Fires when selection is changed
			 * @param {int} selectionIndex
			 * @param {bool} enabled
			 */
			"selectionChanged"
		]);		
    }

	/**
	 * @public
	 * Returns whether histogram has been rendered or not
	 * @returns {boolean} true if histogram has been rendered
	 */
	isRendered(){
		return this._rendered;
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
	 * Render logic of this widget
	 * @param {String|DOMElement} selector selector or DOM element 
	 * @returns {Histogram} returns this widget instance
	 */
	render(selector){
		// get container element using selector or given element
		var ct = this._containerEl = d3.select(selector);
		var width = this._options.width;
		var height = this._options.height;
		var margin = this._options.margin;

		// render SVG
		var svg = this._svgEl = ct.append("svg")
			.attr("width", width + margin * 2)
			.attr("height", height + margin * 2);

		// render group element
		var g = this._groupEl = this._svgEl.append("g")
			.classed(style.inactive, true)
			.attr("transform",
			"translate(" + margin + "," + margin + ")");

		// handle hover over svg element
		svg.on("mouseover.hover", ()=>{
			g.classed(style.active, true)
			g.classed(style.inactive, false)
		})

		svg.on("mouseout.hover", ()=>{
			g.classed(style.inactive, true)
			g.classed(style.active, false)
		})

		this._rendered = true;

		return this;
	} 

	/**
	 * @private
	 * Clears selection controls and data 
	 */
	_clear(){
		this._groupEl.node().innerHTML = "";
	}

	/**
	 * @private
	 * Destroys selection controls 
	 */
	_destroyHandles(){
		this._handles.forEach(handle=>handle.destroy());
		this._handles = [];
	}

	/**
	 * @private
	 * Handles click on handle
	 * @param {Number} handleIndex
	 * @param {Number} handleValue 
	 */
	_onHandleClick(handleIndex, handleValue){
		// TODO: replace this by CAN API or options 
		var promptResult = prompt("value", this._options.format(handleValue));
		if (promptResult == null){
			return;
		}

		// must be within min max range
		var minMax = this._histogramData.getMinMax();
		promptResult = Math.min(minMax.max, promptResult);
		promptResult = Math.max(minMax.min, promptResult);

		var points = this._histogramSelection.getSelectionPoints();
		points[handleIndex] = promptResult;
		var positions = points
			.map(value=>this._histogramData.valueToPosition(value))
			.sort((p1,p2)=>p1-p2);
		
		this._updateSelectionPositions(positions);
		this._updateSelection();

		// TODO: update handles without destroying them
		this._destroyHandles();
		this._renderHandles();
	}

	/**
	 * @private
	 * Toggles selection
	 * @param {Number} selectionIndex 
	 */
	_toggleSelection(selectionIndex){
		var selection = this._options.selection[selectionIndex];
		selection.disabled ^= true;
		this._updateSelection();
		this._observable.fire("toggleSelection", selectionIndex, !selection.disabled);
	}	

	/**
	 * @private
	 * Handles click on chart
	 * @param {HTMLElement} target 
	 */
	_onClick(target){
		var target = d3.select(d3.event.target);
		var selectionIndex = target.attr("data-selection-index");
		var handleIndex = target.attr("data-handle-index");

		if (selectionIndex != null){
			this._toggleSelection(selectionIndex)
		} else if (handleIndex != null){
			this._onHandleClick(handleIndex, target.attr("data-handle-value"));
		}
	}
	/**
	 * @private
	 * Handles handle click 
	 */
	_handleClick(){
		this._groupEl.on("click", this._onClick.bind(this));
	}

	/**
	 * @private
	 * Refreshes histogram data 
	 * @param {HistogramData}
	 * @param {HistogramSelection}
	 */
	refresh(histogramData, histogramSelection){
		this._histogramData = histogramData;
		this._histogramSelection = histogramSelection;
		
		// Scale the range of the data in the domains
		this._xAxis.domain(histogramData.getData().map(function (d) {return d.value; }));
		this._yAxis.domain([0, d3.max(histogramData.getData(), function (d) { return d.volume; })]);

		this._clear();

		this._renderXAxis();		
		this._renderDataBars();
		this._renderSelection();
		this._updateSelection();

		this._handleHoverState();
		if (this._options.enableSelectionToggle){
			this._handleClick();
		}
		
		return this;
	}

	/**
	 * @private
	 * Updates selection controls on hover
	 * @param {Number} selectionIndex 
	 */
	_updateSelectionControlsHoverState(selectionIndex){
		// get all handles sorted by X position
		var handles = this._handles.slice().sort((h1,h2)=>{
			return h1.getXPosition() - h2.getXPosition();
		});

		// unset hover state on all handles
		handles.forEach(handle=>handle.unsetHoverState());

		// selection is active, active both handles for active selection
		if (selectionIndex != null){
			var handle1 = handles[selectionIndex];
			var handle2 = handles[selectionIndex+1];

			handle1.setHoverState();
			handle2.setHoverState();

			var labelOffsets = PositionUtils.getHandlePositionOffsets(handle1, handle2, this._options.maskPadding, this._options.width);
			handle1.setLabelOffset(labelOffsets[0]);
			handle2.setLabelOffset(labelOffsets[1]);
		}
	}	

	/**
	 * 
	 * @private 
	 * Handles what happens when mouse is over selection
	 * @param {String} type 
	 * @param {Number} i 
	 * @param {HTMLElement[]} array 
	 */
	_onSelectionMouseOver(d, i, nodes){
		// prevent selection when dragging handles
		if (this._draggingHandle){
			return;
		}

		d3.select(nodes[i]).attr("fill", "rgba(0,0,0,0.00)")
		var selectionIndex = parseInt(d3.select(d3.event.target).attr("data-selection-index"));
		if (this._overSelectionIndex != selectionIndex){
			this._overSelectionIndex = selectionIndex;
			this._updateSelection();
			this._updateSelectionControlsHoverState(selectionIndex);
			this._observable.fire("selectionOver", this._overSelectionIndex);
		}
	}

	/**
	 * 
	 * @private 
	 * Handles what happens when mouse is out of selection
	 * @param {String} type 
	 * @param {Number} i 
	 * @param {HTMLElement[]} array 
	 */
	_onSelectionMouseOut(d, i, nodes){
		// prevent selection when dragging handles
		if (this._draggingHandle){
			return;
		}
		d3.select(nodes[i]).attr("fill", "rgba(0,0,0,0)")
		this._overSelectionIndex = null;
		this._updateSelectionControlsHoverState(null);
		this._updateSelection();
		this._observable.fire("selectionOver", this._overSelectionIndex);
	}

	/**
	 * @private 
	 * Handles hover state
	 */
	_handleHoverState(){
		var g = this._groupEl;
		g.selectAll("."+style.selectionbar).on("mouseout", this._onSelectionMouseOut.bind(this));
		g.selectAll("."+style.selectionbar).on("mouseover", this._onSelectionMouseOver.bind(this));
	}	

	/**
	 * @private 
	 * Handles when handle is dragged
	 */
	_onHandleDrag(){
		var positions = this._handles.map(handle=>handle.getXPosition()).sort((p1, p2)=>{
			return p1-p2;
		});

		this._updateSelectionPositions(positions);
	}

	/**
	* @private
	* Updates selection with new positions
	* @param {Array} positions
	*/
	_updateSelectionPositions(positions){
		var selection = this._histogramSelection.getSelection();
		positions.forEach((p, index)=>{
			if (index>selection.length-1){
				return;
			}
			selection[index].from = this._histogramData.positionToValue(p);
			selection[index].to = this._histogramData.positionToValue(positions[index+1]);
		});

		this._updateSelection();
	}	

	/**
	* @private
	* Renders selection bars
	*/
	_renderSelection() {
		var height = this._options.height;
		var selection = this._histogramSelection.getSelection();

		// hover selection bars
		this._groupEl.selectAll("."+style.selectionbar)
			.data(selection)
			.enter().append("rect")
			.attr("class", style.selectionbar)
			.attr("y", 0)
			.attr("fill", "rgba(0,0,0,0.00)")
			.attr("height", height);      


		this._renderHandles();
	}

	/**
	* @private
	* Renders selection controls
	*/
	_renderHandles(){
		// render selection controls
		this._handles = this._histogramSelection.getSelectionPoints().map((value, index)=>{
			var handle = new HistogramHandle(this._groupEl, value, index, this._histogramData, this._options);
			handle.on("drag", ()=>{
				this._onHandleDrag();
			}, this);

			var startSelectionSnapshot;

			// disable other handles when draggin starts
			handle.on("startDrag", ()=>{
				startSelectionSnapshot = JSON.stringify(this._options.selection);
				
				this._draggingHandle = true;
				this._handles.forEach(handle=>handle.disable());
				handle.enable();
			}, this);

			// enable all handles when draggin starts
			handle.on("endDrag", ()=>{
				this._draggingHandle = false;
				this._handles.forEach(handle=>handle.enable());

				if (JSON.stringify(this._options.selection) != startSelectionSnapshot){
					this._observable.fire("selectionChanged", this._options.selection);
				}
			}, this);
			return handle;
		});
	}

	/**
	 * @private
	 * Renders data bars
	*/
	_renderDataBars() {
		var data = this._histogramData.getData();
		var height = this._options.height;

		var x = this._xAxis;
		var y = this._yAxis;

		// append the rectangles for the bar chart
		this._groupEl.selectAll("."+style.bar)
			.data(data)
			.enter().append("rect")
			.attr("class", style.bar)
			.attr("x", function (d) { return x(d.value); })
			.attr("width", x.bandwidth())
			.attr("y", function (d) { return Math.round(y(d.volume)); })
			.attr("height", function (d) { return Math.round(height - y(d.volume)); });          
	}

	/**
	* @private
	* Returns bar color based on X position

	* @param {Number} barX
	* @param {Array} selection
	* @returns {Number} bar category index
	*/
	_getBarSelectionIndex(barX, selection){
		for (var i=0;i<selection.length;i++){
			var s = selection[i];
			var within = barX >= this._histogramData.valueToPosition(s.from) && barX < this._histogramData.valueToPosition(s.to);
			if (within) return i;
		}

		return null;
	}	

	/**
	* @private
	* Updates selection
	*/
	_updateSelection(){
		var selection = this._histogramSelection.getSelection();
		var inactiveBarColor = this._options.inactiveBarColor;
		var overSelectionColor = this._options.overSelectionColor;

		// handle bar colors
		this._groupEl.selectAll("."+style.bar).attr("fill", (d)=> {
			var barX = this._histogramData.valueToPosition(d.value);
			var barSelectionIndex = this._getBarSelectionIndex(barX, selection);
			if (barSelectionIndex == null){
				return inactiveBarColor;
			} else if (selection[barSelectionIndex].disabled){
				return inactiveBarColor;
			} if (this._overSelectionIndex == barSelectionIndex){
				return overSelectionColor;
			} else {
				return selection[barSelectionIndex].color || this._options.selectionColor;                    
			}
		});

		// space filling rectangles
		this._groupEl.selectAll("."+style.selectionbar)
			.data(selection)
			.attr("data-selection-index", function(d,i){
				return i;
			})
			.attr("x", (d) => { 
				return this._histogramData.valueToPosition(d.from);
			})
			.attr("width", (d) => {
				return this._histogramData.valueToPosition(d.to) - this._histogramData.valueToPosition(d.from);
			})
	}

	/**
	* @private
	* Renders X axis 
	*/        
	_renderXAxis(){
		var minMax = this._histogramData.getMinMax();
		var format = this._options.format;
		var width = this._options.width;
		var height = this._options.height;

		// create bottom axis
		var axis = d3.axisBottom(this._xAxis)
			.tickValues([minMax.min, minMax.max])
			.tickSize(0)
			.tickFormat(format)
			.tickPadding(15);

		var axisGroup = this._groupEl.append("g")
			.attr("transform", "translate(0," + height + ")")
			.classed(style["x-axis"], true)
			.call(axis);

		//need to offset axis labels by half a pixel, not sure why, needs more investigation
		var offset = 0.5;	

		axisGroup.selectAll(".tick").attr("transform", function(d, i){
			return ["translate("+-offset+",0)", "translate("+width+offset+",0)"][i];
		})

		axisGroup.selectAll(".tick").attr("text-anchor", function(d, i){
			return ["start", "end"][i];
		})
	}	
	
}

export {HistogramRenderer};