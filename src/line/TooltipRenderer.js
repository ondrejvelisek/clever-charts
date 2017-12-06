import style from "./Line.css";
import * as Defaults from "./LineDefaults";
import Observable from "../utils/Observable";
import * as d3 from "d3";

var gradientID = 0;

/**
 * @class
 * Line renderer class
 * @param {Object} options
 */
export default class TooltipRenderer {
    constructor(options) {
		/**
		 * @private 
		 * Line options
		 */
		this._options = options;

		/**
		 * @private 
		 * Main group element of this widget
		 */
		this._groupEl = null;

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
	render(groupEl){
		this._groupEl = groupEl;
		this._rendered = true;

		this._groupEl.on("mouseout", this._onMouseOut.bind(this))

		return this;
	}

	_getTextAnchor(xPos, bottomLabelWidth, width){
		var xpos = xPos;
		if (xpos - bottomLabelWidth/2 < 0){
			return "start"
		} else if (xpos + bottomLabelWidth/2 > width){
			return "end"
		} else {
			return "middle";
		}
	}

	_getTooltipHTML(d){
		return d.tooltips.filter((tooltip, index)=>{
			return d.values[index] != null;
		}).map((tooltip, index)=>{
			const value = tooltip || this._options.format(d.values[index]);
			var color = this._options.lineColors[index] || this._options.lineColor;
			const icon = `
				<span style="display:inline-block;position:relative;top:-1px;margin-right:5px;width:6px;height:6px;border-radius:50%;background-color:${color}"></span>
			`;
			return icon + value;
		}).join("<br />");
	}

	_onHoverAreaOver(d){
		var duration = this._tooltipGroup.attr("visibility") == "visible"?0:0;
		var x = this._xAxis;
		var y = this._yAxis;
		var width = this._options.width;
		var xPos = x(d.label);

		// update tooltip position
		this._tooltipGroup
			.transition()
			.duration(duration)
			.attr("visibility", "visible")
			.attr("transform", "translate("+xPos+", 0)")

		// update tooltip bottom label
		var bottomLabelWidth = this._tooltipBottomLabel.node().getBBox().width;
		var bottomMaskPadding = 25;
		var textAnchor = this._getTextAnchor(xPos, bottomLabelWidth, width);

		this._tooltipBottomLabel
			.text(d.label)
			.attr("text-anchor", textAnchor);

		this._tooltipBottomLabel.attr("transform", ()=>{
			return {
				"start":"translate("+-xPos+", 0)",
				"middle":"translate(0, 0)",
				"end":"translate("+(width-xPos)+", 0)"
			}[textAnchor]
		});
		
		var bottomMaskWidth = bottomMaskPadding*2 + bottomLabelWidth;
		this._tooltipBottomLabelMask
			.attr("width", bottomMaskWidth)
			.attr("x", ()=>{
				return {
					"start":-xPos-bottomMaskPadding,
					"middle":-bottomMaskWidth/2,
					"end":width-xPos-bottomMaskWidth+bottomMaskPadding,
				}[textAnchor]
			})

		this._handleMaskGradientEl.attr("x1", -bottomMaskWidth/2);
		this._handleMaskGradientEl.attr("x2", bottomMaskWidth/2);			

		// update tooltip top label 
		var tooltipHtml = this._getTooltipHTML(d);
		this._tooltipTopLabel.node().innerHTML = tooltipHtml;
		var labelLeft = this._getLabelLeft(xPos);

		// if value is not null or undefined
		if (d.values.some(d => d != null)){
			this._tooltipTopLabel
				.style("left", labelLeft+"px")
				.style("visibility", "visible")
				.style("top", y(Math.max.apply(Math,d.values))-50+"px")

			// update line circle
			this._tooltipLineCircle
				.transition()
				.duration(duration)
				.style("visibility", (circle, i)=>{
					return d.values[i]?"visible":"hidden";
				})
				.attr("cy", (circle, i)=>{
					return d.values[i]?y(d.values[i]):0
				})				
		} else {
			this._tooltipTopLabel.style("visibility", "hidden");
			this._tooltipLineCircle.style("visibility", "hidden");
		}
	
	}

	_getLabelLeft(xPos){
		var labelWidth = this._tooltipTopLabel.node().offsetWidth;
		var labelLeft = xPos-labelWidth/2;
		
		if (labelLeft<0){
			labelLeft = 0;
		}

		if (labelLeft>this._options.width - labelWidth){
			labelLeft = this._options.width - labelWidth;
		}

		return labelLeft;
	}

	_onMouseOut(){
		// only hide when mouse is outside of widget
		if (!this._groupEl.node().parentNode.contains(d3.event.relatedTarget)){
			this._hideTooltip();
			this._tooltipLineCircle.style("visibility", "hidden");
		}
		
	}

	_hideTooltip(){
		this._tooltipGroup.attr("visibility", "hidden")
		this._tooltipTopLabel.style("visibility", "hidden")
	}

	_renderTooltip(){
		var data = this._lineData.getMergedData();
		
		var series = this._lineData.getSeries();
		var hoverWidth;
		if (data.length>series.length){
			hoverWidth = this._options.width / (data.length-1);
		} else {
			hoverWidth = this._options.width;
		}

		this._hoverAreas = this._groupEl
			.selectAll("."+style["tooltip-hover-area"])
			.data(data)
			.enter()
			.append("rect")
			.attr("class", style["tooltip-hover-area"])
			.attr("width", hoverWidth)
			.attr("fill-opacity", 0.00)
			.attr("x", (d)=>{
				return this._xAxis(d.label) - hoverWidth/2
			})
			.attr("height", this._options.height)
			.on("mouseover", this._onHoverAreaOver.bind(this))

		this._tooltipGroup = this._groupEl
			.append("g")
			.attr("visibility", "hidden")
			.attr("class", style["tooltip-group"])


		this._tooltipLineCircle = this._tooltipGroup
			.selectAll("."+style["tooltip-line-circle"])
			.data(series)
			.enter()
			.append("circle")
			.attr("visibility", "hidden")
			.attr("class", style["tooltip-line-circle"])
			.attr("stroke-width", this._options.lineWidth)
			.attr("stroke", (d, i)=>{
				return this._options.lineColors[i] || this._options.lineColor;
			})
			.attr("stroke-opacity", this._options.lineOpacity)
			.attr("r", 2.5+this._options.lineWidth/2)

		this._tooltipAxisCircle = this._tooltipGroup
			.append("circle")
			.attr("class", style["tooltip-axis-circle"])
			.attr("stroke-width", 1)
			.attr("cy", this._options.height - Defaults.MARGIN.bottom)
			.attr("r", 2.5 + 1/2)

		this._tooltipBottomLabelMask = this._tooltipGroup
			.append("rect")
			.attr("fill", "url(#"+this._handleMaskGradientEl.attr("id")+")")
			.attr("class", style["tooltip-label-mask"])
			.attr("y", this._options.height - Defaults.LABEL_OFFSET-15)
			.attr("height", 20)

		this._tooltipBottomLabel = this._tooltipGroup
			.append("text")
			.attr("class", style["tooltip-label"])
			.attr("y", this._options.height - Defaults.LABEL_OFFSET)
			.attr("text-anchor", "start")
			.text(data[0].label)

		this._tooltipTopLabel = d3.select(this._groupEl.node().parentNode.parentNode)
			.insert("span", ":first-child")
			.attr("class", style["tooltip-top-label"])
			.style("position", "absolute")
			.style("visibility", "hidden")

		this._tooltipRendered = true;
	}

	/**
	 * Creates mask gradient element
	 * @param {Number} handleIndex 
	 */
	_createMaskGradientElement(){
		this._handleMaskGradientEl = this._groupEl.append("linearGradient")
			.attr("id", style["tooltip-label-mask"]+"-"+(gradientID++)+"-gradient")
			.attr("gradientUnits", "userSpaceOnUse")
			.attr("y1", "0").attr("x1", "0")
			.attr("y2", "0").attr("x2", "0");

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
	 * Clears selection controls and data 
	 */
	_clear(){
		if (this._tooltipRendered){
			this._hoverAreas.remove();
			this._tooltipGroup.remove();
			this._tooltipTopLabel.remove();
			this._tooltipRendered = false;
		}
	}

	/**
	 * @private
	 * Sets line data 
	 * @param {LineData}
	 */
	update(lineData, x, y){
		this._xAxis = x;
		this._yAxis = y; 
		this._lineData = lineData;

		this._createMaskGradientElement();
		this._clear();
		this._renderTooltip();

		return this;
	}

	/**
	 * @public
	 * Destorys Line UI  
	 */
	destroy() {
		if (this._rendered){
			this._clear();
		}

		this._observable.destroy();

		return this;
    }	
	
}