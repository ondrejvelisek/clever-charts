import * as d3 from "d3";
import Observable from "../utils/Observable";
import * as Defaults from "./LineDefaults";
import LineData from "./LineData";
import LineRenderer from "./LineRenderer";

/**
 * @private 
 * @param {*} optionValue option value 
 * @param {*} defaultOptionValue default option value 
 * @returns option or default option value 
 */
function getOptionValue(optionValue, defaultOptionValue) {
	return typeof optionValue == "undefined" ? defaultOptionValue : optionValue;
}

/**
 * @class
 * Main Line class
 * @param {Object} options
 */
class Line {
	constructor(options) {
		/**
		 * @private
		 * Options property exposing widget's options
		 */
		this._options = {};

		/**
		 * @public
		 * Width of the widget
		 */
		this._options.width = getOptionValue(options.width, Defaults.WIDTH);
		/**
		 * @public
		 * Height of the widget
		 */
		this._options.height = getOptionValue(options.height, Defaults.HEIGHT);

		/**
		 * @public
		 * Line width
		 */
		this._options.lineWidth = getOptionValue(options.lineWidth, Defaults.LINE_WIDTH);		

		/**
		 * @public
		 * Dot size
		 */
		this._options.dotSize = getOptionValue(options.dotSize, Defaults.DOT_SIZE);				

		/**
		 * @public
		 * Format for widget labels 
		 */
		this._options.format = getOptionValue(options.format, null);

		/**
		 * @public
		 * Line color 
		 */
		this._options.lineColor = getOptionValue(options.lineColor, Defaults.LINE_COLOR);

		/**
		 * @public
		 * Line colors 
		 */
		this._options.lineColors = getOptionValue(options.lineColors, Defaults.LINE_COLORS);		

		/**
		 * @public
		 * Line opacity 
		 */
		this._options.lineOpacity = getOptionValue(options.lineOpacity, Defaults.LINE_OPACITY);

		/**
		 * @public
		 * Fill color 
		 */
		this._options.fillColor = getOptionValue(options.fillColor, Defaults.FILL_COLOR);

		/**
		 * @public
		 * Fill colors
		 */
		this._options.fillColors = getOptionValue(options.fillColors, Defaults.FILL_COLORS);		

		/**
		 * @public
		 * Fill opacity
		 */
		this._options.fillOpacity = getOptionValue(options.fillOpacity, Defaults.FILL_OPACITY);

		/**
		 * @public
		 * Axis color
		 */
		this._options.axisColor = getOptionValue(options.axisColor, Defaults.AXIS_COLOR);		


		/**
		 * @public
		 * Axis color
		 */
		this._options.zeroLineColor = getOptionValue(options.zeroLineColor, Defaults.ZERO_LINE_COLOR);		

		/**
		 * @public
		 * Vertical spacing
		 */
		this._options.verticalSpacing = getOptionValue(options.verticalSpacing, this._options.height / 4);		
		
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

		/**
		 * @private
		 * LineRenderer
		 */
		this._lineRenderer = new LineRenderer(this._options);

		this._lineRenderer.on("pointOver", data=>{
			this._observable.fire("pointOver", data);
		})
	}

	/**
	 * Bind widget event
	 * @param {String} event event name
	 * @param {Function} handler event handler
	 * @returns {Line} returns this widget instance
	 */
	on(eventName, handler) {
		this._observable.on(eventName, handler);
		return this;
	}

	/**
	 * Unbind widget event
	 * @param {String} event event name
	 * @param {Function} [handler] event handler
	 * @returns {Line} returns this widget instance
	 */
	off(eventName, handler) {
		this._observable.off(eventName, handler);
		return this;
	}	

	/**
	 * Destroys widget
	 * @returns {Line} returns this widget instance
	 */
	destroy() {
		this._observable.destroy();
		this._lineRenderer.destroy();
		this._options = null;

		return this;
	}	

	/**
	 * Render logic of this widget
	 * @param {String|DOMElement} selector selector or DOM element 
	 * @returns {Line} returns this widget instance
	 */
	render(selector) {
		this._lineRenderer.render(selector);
		return this;
	}

	/**
	 * Sets multiple series of data
	 * @param {Array[]} series
	 * @returns {Line} returns this widget instance 
	 */
	setSeries(series) {
		return this.setData.apply(this, series);
	}

	/**
	 * Sets line data
	 * @param {...Array} series
	 * @returns {Line} returns this widget instance 
	 */
	setData(...series) {
		if (!this._lineRenderer.isRendered()) {
			throw "Can't call setData() when widget is not rendered, please call .render() first."
		}

		var lineData = this._lineData = new LineData(series, this._options);

		if (!this._options.format) {
			this._options.format = d3.format(",." + this._lineData.getPrecision() + "f")
		} else if (typeof this._options.format == "string"){
			this._options.format = d3.format(this._options.format);
		}

		this._lineRenderer.update(lineData);

		return this;
	}
}

export default Line;
