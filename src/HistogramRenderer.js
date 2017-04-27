import style from "./Histogram.css";
import {HistogramHandle} from "./HistogramHandle.js";
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

		this._renderXAxis();		
		this._renderDataBars();
		this._renderSelection();

		this._updateSelection();

		

		// handleHoverState(g, x);
		// handleClick(g, x, data, minMax);

		return this;
	}

	_onHandleDrag(){
		// TODO: replace this by getting position from each handle
		var positions = this._groupEl.selectAll("."+style["custom-handle"]).nodes().map(handle=>{
			return Math.round(d3.select(handle).attr("x"))+5;
		}).sort((p1, p2)=>{
			return p1-p2;
		});

		this._updateSelectionPositions(positions);
	}

	/**
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

		// render selection controls
		this._handles = this._histogramSelection.getSelectionPoints().map((value, index)=>{
			var handle = new HistogramHandle(this._groupEl, value, index, this._histogramData, this._options);
			handle.on("drag", ()=>{
				this._onHandleDrag();
			}, this);
			return handle;
		});			      
	};  	

	/**
	 * Renders data bars
	*/
	_renderDataBars() {
		var data = this._histogramData.getData();
		var height = this._options.height;

		var x = this._xAxis;
		var y = this._yAxis;

		// append the rectangles for the bar chart
		var bar = this._groupEl.selectAll("."+style.bar)
			.data(data)
			.enter().append("rect")
			.attr("class", style.bar)
			.attr("x", function (d) { return x(d.value); })
			.attr("width", x.bandwidth())
			.attr("y", function (d) { return Math.round(y(d.volume)); })
			.attr("height", function (d) { return Math.round(height - y(d.volume)); });          
	};

	/**
	* Returns bar color based on X position

	* @param {Number} barX
	* @param {Array} selection
	* @returns {Number} bar category index
	*/
	_getBarCategoryIndex(barX, selection){
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
		var inactiveCategoryColor = this._options.inactiveCategoryColor;
		// handle bar colors
		this._groupEl.selectAll("."+style.bar).attr("fill", (d)=> {
			var barX = this._histogramData.valueToPosition(d.value);
			var barCategoryIndex = this._getBarCategoryIndex(barX, selection);
			if (barCategoryIndex == null){
				return inactiveCategoryColor;
			} else if (selection[barCategoryIndex].disabled){
				return inactiveCategoryColor;
			} if (this._overSelectionIndex == barCategoryIndex){
				return hoverCategoryColor;
			} else {
				return selection[barCategoryIndex].color;                    
			}
		});

		// space filling rectangles
		this._groupEl.selectAll("."+style.selectionbar)
			.data(selection)
			.attr("data-category-index", function(d,i){
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

		axisGroup.selectAll(".tick").attr("transform", function(d, i){
			var textLength = d3.select(this).select("text").node().getComputedTextLength();
			if (i == 0){
				return "translate("+textLength/2+",0)"
			}

			if (i == 1){
				return "translate("+(width-textLength/2)+",0)"
			}
		})
	}	
	
}

export {HistogramRenderer};