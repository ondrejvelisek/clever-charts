import style from "./Bar.css";
import * as Defaults from "./BarDefaults";
import Observable from "../utils/Observable";
import * as d3 from "d3";

var MASK_INDEX = 0;

/**
 * @class
 * Bar renderer class
 * @param {Object} options
 */
export default class BarRenderer {
    constructor(options) {
		/**
		 * @private 
		 * Bar options
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
		this._barData = null;

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
		 * true if Bar has been rendered
		 */
		this._rendered = false;

		/**
		 * @private
		 * observable handler
		 */
		this._observable = new Observable([
			/**
			 * @event 
			 * Fires when mouse is over a bar
			 * @param {int} barIndex
			 */
			"barOver",
			/**
			 * @event 
			 * Fires when mouse is out of a bar
			 * @param {int} barIndex
			 */
			"barOut",			
			/**
			 * @event 
			 * Fires when bar is clicked
			 * @param {int} barIndex
			 */
			"barClick",			
			/**
			 * @event 
			 * Fires when bar is disabled
			 * @param {int} barIndex
			 * @param {boolean} disabled
			 */
			"barDisabled"
		]);

		this._maskIndex = MASK_INDEX++;
    }

	/**
	 * @public
	 * Returns whether Bar has been rendered or not
	 * @returns {boolean} true if Bar has been rendered
	 */
	isRendered(){
		return this._rendered;
	}

	/**
	 * @public
	 * Bind handle event
	 * @param {String} event event name
	 * @param {Function} handler event handler
	 * @returns {BarHandle} returns this handle instance
	 */
	on(eventName, handler) {
		this._observable.on(eventName, handler);
		return this;
	}	

	/**
	 * @public
	 * Render logic of this widget
	 * @param {String|DOMElement} selector selector or DOM element 
	 * @returns {Bar} returns this widget instance
	 */
	render(selector){
		// get container element using selector or given element
		var ct = this._containerEl = d3.select(selector);
		var width = this._options.width;
		var height = this._options.height;

		// render SVG
		this._svgEl = ct.append("svg")
			.attr("width", width)
			.attr("class", style.bar)
			.attr("height", height);

		// render group element
		this._groupEl = this._svgEl.append("g");


		this._clipPath = this._svgEl.append("clipPath")
			.attr("id", "rounded-corners-"+this._maskIndex)
			.append("rect")
			.attr("y", this._options.labelFontSize + 10)
			.attr("rx", 2.5)
			.attr("ry", 2.5)
			.attr("width",this._options.width)
			.attr("height", 5);

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
	 * Sets bar data 
	 * @param {BarData}
	 */
	setData(barData){
		this._barData = barData;		
		this._clear();

		var data = barData.getMergedData();
		var minMax = barData.getMinMax();

		var barHeight = this._options.barHeight;
		var height = data.length * barHeight;

		this._xAxis = d3.scaleLinear().range([0, this._options.width]);
		this._yAxis = d3.scaleBand().range([height, 0]);	

		this._svgEl.attr("height", height);	

		this._xAxis.domain([0, minMax.max]);
		this._yAxis.domain(data.map((item, i)=>i).reverse());

		this._renderDataBars(data);

		return this;
	}

	/**
	 * @private
	 * @param {Array} data
	 * Renders data bars
	*/
	_renderDataBars(data) { 
		var x = this._xAxis;
		var y = this._yAxis;
		var horizontalPadding = 10;
		var barHeight = 5;
		var observable = this._observable;
		var options = this._options;
		
		data.forEach((d, i)=>{
			const barGroup = this._groupEl
				.datum(d)
				.append("g")
				.attr("class", style["bar"])
				.attr("transform", ()=> {
					return "translate(0,"+ (Math.floor(y(i)))+")"
				})
				.classed(style["bar-over"], (d)=>{
					return d.highlighted;
				})
				.on("mouseover", function(d, i){
					if (options.enableBarHover){
						d3.select(this).classed(style["bar-over"], true);
						observable.fire("barOver", i);
					}
				})
				.on("mouseout", function(d, i){
					if (options.enableBarHover){
						d3.select(this).classed(style["bar-over"], false);
						observable.fire("barOut", i);
					}
				})
				.on("click", function(d, i){
					if (options.enableBarToggle){
						var disabled = !d3.select(this).classed(style["bar-disabled"]);
						d3.select(this).classed(style["bar-disabled"], disabled);
						observable.fire("barDisabled", i, disabled);
					}
	
					observable.fire("barClick", i);
				})
				.classed(style["bar-disabled"], (d)=>{
					return d.disabled;
				});

				// label
				barGroup.append("text")
					.text(d=>d.label)
					.attr("class", style["bar-label"])
					.attr("x", horizontalPadding)
					.attr("font-size", this._options.labelFontSize)
					.attr("y", this._options.labelFontSize)

				// tooltip
				let tooltipX = horizontalPadding;
				d.values.forEach((value, valueIndex)=>{
					const tooltipEl = barGroup.append("text")
						.text(()=>{
							// generating tooltip in reversed order as it goes from right -> left
							const reversedIndex = d.values.length - 1 - valueIndex;
							return d.tooltips[reversedIndex] || this._options.format(d.values[reversedIndex])
						})
						.attr("class", style["bar-tooltip"])
						.attr("x", this._options.width-tooltipX)
						.attr("text-anchor","end")
						.attr("font-size", this._options.valueFontSize)
						.attr("y", this._options.labelFontSize)

					tooltipX+= tooltipEl.node().getComputedTextLength()+25;

					if (d.values.length>1){
						barGroup
							.append("circle")
							.attr("r", 3)
							.attr("fill", ()=>{
								// generating in reversed order as it goes from right -> left
								const reversedIndex = d.values.length - 1 - valueIndex;
								return d.colors[reversedIndex] || options.activeBarColors[reversedIndex] || options.activeBarColor
							})
							.attr("cx", this._options.width-tooltipX-this._options.labelFontSize+30)
							.attr("cy", this._options.labelFontSize/1.5)
					}

					const barOffset = valueIndex*(barHeight+1);
					// active bar
					barGroup.append("rect")
						.attr("transform", "translate(0,"+ barOffset + ")")						
						.attr("fill",()=>{
							return d.colors[valueIndex] || options.activeBarColors[valueIndex] || options.activeBarColor;
						})
						.attr("class", style["bar-active"])
						.attr("x", 0)
						.attr("clip-path", "url(#rounded-corners-"+this._maskIndex+")")
						.attr("width", function () { return Math.floor(x(value)); })
						.attr("y", this._options.labelFontSize + 10)
						.attr("height", barHeight);

					// inactive bar
					barGroup.append("rect")
						.attr("transform", "translate(0,"+ barOffset + ")")						
						.attr("fill",Defaults.INACTIVE_BAR_COLOR)
						.attr("class", style["bar-inactive"])
						.attr("clip-path", "url(#rounded-corners-"+this._maskIndex+")")
						.attr("x", () => {
							return Math.floor(x(value));
						})
						.attr("width", ()=> { return this._options.width - Math.floor(x(value)); })
						.attr("y", this._options.labelFontSize + 10)
						.attr("height", barHeight)
				});
				
				// hover
				barGroup.append("rect")
					.attr("class", style["bar-hover"])
					.attr("fill", "transparent")
					.attr("x", 0)
					.attr("text-anchor","end")
					.attr("cursor",()=>this._options.enableBarHover?"pointer":"default")
					.attr("y", 0)
					.attr("height", this._options.barHeight)					
					.attr("width", this._options.width)

		});
		

		
	}

	/**
	 * @public
	 * Destorys Bar UI  
	 */
	destroy() {
		if (this._rendered){
			this._containerEl.node().removeChild(this._svgEl.node());
		}

		this._observable.destroy();

		return this;
    }	
	
}