import style from "./Doughnut.css";
import Observable from "../utils/Observable";
import * as d3 from "d3";

const tau = 2 * Math.PI; // http://tauday.com/tau-manifesto

/**
 * @class
 * Doughnut renderer class
 * @param {Object} options
 */
export default class DoughnutRenderer {
	constructor(options) {
		/**
		 * @private 
		 * Doughnut options
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
		 * true if Doughnut has been rendered
		 */
		this._rendered = false;

		/**
		 * @private
		 * observable handler
		 */
		this._observable = new Observable([
			/**
			 * @event 
			 * Fires when mouse is over
			 */
			"mouseOver",
			/**
			 * @event 
			 * Fires when mouse is out
			 */
			"mouseOut"
		]);		
	}

	/**
	 * @public
	 * Returns whether Doughnut has been rendered or not
	 * @returns {boolean} true if Doughnut has been rendered
	 */
	isRendered() {
		return this._rendered;
	}

	/**
	 * @public
	 * Render logic of this widget
	 * @param {String|DOMElement} selector selector or DOM element 
	 * @returns {Doughnut} returns this widget instance
	 */
	render(selector) {
		// get container element using selector or given element
		var ct = this._containerEl = d3.select(selector);
		var width = this._containerEl.node().offsetWidth;
		var height = this._containerEl.node().offsetHeight;
		var value = this._value = this._options.value;
		var angle = this._angle = value / 100 * tau;
		var innerRadius = this._innerRadius = this._options.innerRadius;
		var outerRadius = this._outerRadius = this._options.outerRadius;

		// arc settings
		var arc = this._arc = d3.arc()
			.innerRadius(innerRadius)
			.outerRadius(outerRadius)
			.startAngle(0);

		// render SVG
		this._svgEl = ct.append("svg")
			.attr("width", width)
			.attr("height", height)
			.attr("class", style["svg"]);

		// render group
		var g = this._groupEl = this._svgEl
			.append("g")
			.attr("class", style["doughnut"])
			.attr("transform", "translate(" + width / 2 + ", " + height / 2 + ")");

		// render inactive doughtnut	
		this._inactiveArc = g.append("path")
			.datum({ endAngle: tau })
			.attr("fill", this._options.inactiveColor)
			.attr("d", arc);

		// render active doughtnut	
		this._activeArc = g.append("path")
			.datum({ endAngle: angle })
			.attr("fill", this._options.activeColor)
			.attr("d", arc);

		// render background	
		this._backgroundArc = g.append("circle")
			.attr("fill", this._options.backgroundColor)
			.attr("r", innerRadius)
			.attr("cx", 0)
			.attr("cy", 0)

		// render background	
		this._backgroundArc = g.append("circle")
			.attr("fill", this._options.backgroundColor)
			.attr("r", innerRadius)
			.attr("cx", 0)
			.attr("cy", 0)

		// hover element, this needs to be rendered in order to have stable and animation
		// independent hover 
		this._hoverEl = g.append("rect")
			.attr("fill", "transparent")
			.attr("x", -width/2)
			.attr("y", -height/2)
			.attr("width",width)
			.attr("height",height)

		g.on("mouseover", ()=>{
			this._observable.fire("mouseOver");
		})

		g.on("mouseout", ()=>{
			this._observable.fire("mouseOut");
		})

		this._rendered = true;

		return this;
	}

	/**
		 * Bind widget event
		 * @param {String} event event name
		 * @param {Function} handler event handler
		 * @returns {Doughnut} returns this widget instance
		 */
		on(eventName, handler) {
			this._observable.on(eventName, handler);
			return this;
		}

		/**
		 * Unbind widget event
		 * @param {String} event event name
		 * @param {Function} [handler] event handler
		 * @returns {Doughnut} returns this widget instance
		 */
		off(eventName, handler) {
			this._observable.off(eventName, handler);
			return this;
		}	
	

	/**
	 * @public
	 * @param {opts} new options
	 * Updates doughnut with new options
	 */
	update(opts) {
		var options = opts || {};

		if (typeof options.value == "undefined"){
			options.value = this._value;
		} else {
			this._value = options.value;
		}

		// first tween foreground, note that this is also changing this._arc radiuses 
		var activeArcTransition = this._activeArc.transition()
			.duration(this._options.animationDuration)
			.attrTween("d", this._arcTween(options, true))

		// se we only get new path on background as it uses radiuses saved in the previous call
		this._inactiveArc.transition()
			.duration(this._options.animationDuration)
			.attrTween("d", () => {
				return () => {
					return this._arc({ endAngle: tau });
				}
			});

		this._backgroundArc.transition()
			.duration(this._options.animationDuration)
			.attrTween("r", () => {
				return () => {
					return this._innerRadius;
				}
			});

		if (options.activeColor && options.activeColor !== this._options.activeColor){
			this._options.activeColor = options.activeColor;
			activeArcTransition.attr("fill", options.activeColor)
		}

		return this;
	}

	/**
	 * @private
	 * @param {options} new options
	 * returns tween function for arc 
	 */
	_arcTween(options) {
		var angle = options.value / 100 * tau;
		// change angle if new value is provided 
		if (typeof options.value != "undefined") {
			angle = options.value / 100 * tau;
		}

		// handle new radiuses
		var innerRadius = this._innerRadius;
		var outerRadius = this._outerRadius;

		if (typeof options.innerRadius != "undefined") {
			innerRadius = options.innerRadius;
		}

		if (typeof options.outerRadius != "undefined") {
			outerRadius = options.outerRadius;
		}

		// get interpolation fns between new radiuses and old ones
		// for simlicity, do this even if value doesn't change as we
		// likely generate new path anyway
		var interpolateOuterRadius = d3.interpolate(this._outerRadius, outerRadius);
		var interpolateInnerRadius = d3.interpolate(this._innerRadius, innerRadius);

		return (d) => {
			// get angle interpolation fn 
			var interpolateAngle = d3.interpolate(d.endAngle, angle);

			return (t) => {
				// on each cycle, set new radiuses and endAngle
				this._arc.outerRadius(this._outerRadius = interpolateOuterRadius(t));
				this._arc.innerRadius(this._innerRadius = interpolateInnerRadius(t));

				d.endAngle = this._angle = interpolateAngle(t);
				return this._arc(d);
			};
		};
	}

	/**
	 * @public
	 * Destorys Doughnut UI  
	 */
	destroy() {
		if (this._rendered) {
			this._containerEl.node().removeChild(this._svgEl.node());
		}

		this._observable.destroy();

		return this;
	}

}