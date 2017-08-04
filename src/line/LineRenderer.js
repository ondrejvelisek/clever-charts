import style from "./Line.css";
import * as Defaults from "./LineDefaults";
import Observable from "../utils/Observable";
import TooltipRenderer from "./TooltipRenderer";
import * as d3 from "d3";

/**
 * @class
 * Line renderer class
 * @param {Object} options
 */
export default class LineRenderer {
    constructor(options) {
		/**
		 * @private 
		 * Line options
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
		 * Line data 
		 */
		this._lineData = null;

		/**
		 * @private
		 * X axis
		 */
		this._xAxis = null;

		/**
		 * @private
		 * Y axis
		 */
		this._yAxis = null;

		/**
		 * @private
		 * true if Line has been rendered
		 */
		this._rendered = false;

		/**
		 * @private
		 * stores previous data for animation
		 */
		this._prevData = null;		

		/**
		 * @private
		 * observable handler
		 */
		this._observable = new Observable([
			/**
			 * @event 
			 * Fires when mouse is over a line point
			 * @param {Array} [x,y] data
			 */
			"pointOver"
		]);

		this._tooltipRenderer = new TooltipRenderer(options);
    }

	/**
	 * @public
	 * Returns whether Line has been rendered or not
	 * @returns {boolean} true if Line has been rendered
	 */
	isRendered(){
		return this._rendered;
	}

	/**
	 * @public
	 * Bind handle event
	 * @param {String} event event name
	 * @param {Function} handler event handler
	 * @returns {LineHandle} returns this handle instance
	 */
	on(eventName, handler) {
		this._observable.on(eventName, handler);
		return this;
	}	

	/**
	 * @public
	 * Render logic of this widget
	 * @param {String|DOMElement} selector selector or DOM element 
	 * @returns {Line} returns this widget instance
	 */
	render(selector){
		// get container element using selector or given element
		var ct = this._containerEl = d3.select(selector);
		var width = this._options.width;
		var height = this._options.height;

		// force position relative so the toolip shows correctly
		ct.style("position", "relative");

		// render SVG
		this._svgEl = ct.append("svg")
			.attr("width", width)
			.attr("class", style.svg)
			.attr("height", height);

		// render group element
		this._groupEl = this._svgEl.append("g");

		this._tooltipRenderer.render(this._groupEl);

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
	 * Sets line data 
	 * @param {LineData}
	 */
	update(lineData){
		this._lineData = lineData;		
		this._clear();

		var width = this._options.width;
		var height = this._options.height;
		var verticalSpacing = this._options.verticalSpacing;

		var data = lineData.getData();
		var minMax = lineData.getMinMax();

		var x = this._xAxis = d3.scalePoint().range([0, width]);	
		var y = this._yAxis = d3.scaleLinear().range([height-verticalSpacing, verticalSpacing]);

		x.domain(data.map(function (d) {return d.label; }));
		y.domain([minMax.min, minMax.max]);

		this._renderDataLines(data);
		this._renderZeroLine(data);
		this._renderXAxis(data);
		this._tooltipRenderer.update(lineData, x, y);

		return this;
	}

	/**
	 * @private
	 * @param {Array} data
	 * Renders x axis
	*/
	_renderXAxis(data){
		this._groupEl.append("line")
			.attr("x1", 0)
			.attr("x2", this._options.width)
			.attr("y1", this._options.height-Defaults.MARGIN.bottom)
			.attr("y2", this._options.height-Defaults.MARGIN.bottom)
			.attr("stroke-width", 1)
			.attr("stroke", this._options.axisColor)

		// render to labels on start and end sides if multiple items are available
		if (data.length>1){
			this._groupEl
				.append("text")
				.text(data[0].label)
				.attr("x", 0)
				.attr("y", this._options.height-Defaults.LABEL_OFFSET)

			this._groupEl
				.append("text")
				.text(data[data.length-1].label)
				.attr("x", this._options.width)
				.attr("text-anchor", "end")
				.attr("y", this._options.height-Defaults.LABEL_OFFSET)	

		// render single label in the middle if only one item is available				
		} else if (data.length == 1){
			this._groupEl
				.append("text")
				.text(data[0].label)
				.attr("x", this._options.width/2)
				.attr("text-anchor", "middle")
				.attr("y", this._options.height-Defaults.LABEL_OFFSET)	
		}	
	}
	/**
	 * Returns true if graph should render zero line
	 * @param {Array} data 
	 */
	_showZeroLine(){
		var zeroLinePosition = this._yAxis(0);
		var axisPosition = this._options.height-Defaults.MARGIN.bottom;
		var treshold = 10;
		return zeroLinePosition<axisPosition-treshold;
	}
	/**
	 * @private
	 * @param {Array} data
	 * Renders zero line
	*/
	_renderZeroLine(){
		if (this._showZeroLine()){
			this._groupEl.append("line")
				.attr("x1", 0)
				.attr("x2", this._options.width)
				.attr("y1", Math.round(this._yAxis(0)))
				.attr("y2", Math.round(this._yAxis(0)))
				.attr("stroke-dasharray","2 ,2")
				.attr("stroke", this._options.zeroLineColor)
		}
	}

	/**
	 * @private
	 * @param {Array} data
	 * Renders data lines
	*/
	_renderDataLines(data) { 
		var x = this._xAxis;
		var y = this._yAxis;
		
		var options = this._options;
		var minHeight = this._options.height-Defaults.MARGIN.bottom;

		var areaZero = this._showZeroLine()?Math.min(minHeight, y(0)):minHeight;

		// define the area
		var area = d3.area()
			.x(function(d) {return x(d.label); })
			.y0(areaZero)
			.y1(function(d) { return y(d.value); });

		// define the line
		var line = d3.line()
			.x(function(d) { return x(d.label); })
			.y(function(d) { return y(d.value); });		

		// apply grouping if needed (null or other splits)
		const groupedData = this._getGroupedData(data);

		groupedData.forEach(lineData=>{
			// add the area path
			this._groupEl.append("path")
			.data([lineData])
			.attr("class", style["area"])
			.attr("fill", options.fillColor)
			.attr("fill-opacity", options.fillOpacity)
			.attr("d", area);

			// add the line path
			this._groupEl.append("path")
				.data([lineData])
				.attr("fill", "none")
				.attr("stroke-linecap", "round")
				.attr("stroke", options.lineColor)
				.attr("stroke-opacity", options.lineOpacity)
				// note that in case of a single item, dot is rendered with a different size
				.attr("stroke-width", lineData.length>1?options.lineWidth:options.dotSize)
				.attr("class", style["line"])
				.attr("d", line);
		});
		

	}

	/**
	 * @private
	 * Splits given array into multiple in case there is null in value
	 * @param {Array} data 
	 */
	_getGroupedData(data){
		let group = [];
		const result = [group];
		
		data.forEach(item=>{
			if (item.value === null){
				group = [];
				result.push(group);
			} else {
				group.push(item);
			}
		});

		return result;
	}

	/**
	 * @public
	 * Destorys Line UI  
	 */
	destroy() {
		if (this._rendered){
			this._containerEl.node().removeChild(this._svgEl.node());
		}

		this._observable.destroy();

		return this;
    }	
	
}