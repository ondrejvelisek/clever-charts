import * as d3 from "d3";
import Observable from "../utils/Observable";
import * as Defaults from "./BarDefaults";
import BarData from "./BarData";
import BarRenderer from "./BarRenderer";

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
 * Main Bar class
 * @param {Object} options
 */
class Bar {
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
		this._options.barHeight = getOptionValue(options.barHeight, Defaults.BAR_HEIGHT);

		/**
		 * @public
		 * Format for widget labels 
		 */
		this._options.format = getOptionValue(options.format, null);

		/**
		 * @public
		 * Label font size 
		 */
		this._options.labelFontSize = getOptionValue(options.labelFontSize, Defaults.LABEL_FONT_SIZE);

		/**
		 * @public
		 * Label font size 
		 */
		this._options.valueFontSize = getOptionValue(options.valueFontSize, Defaults.VALUE_FONT_SIZE);

		/**
		 * @public
		 * Inactive bar color 
		 */
		this._options.inactiveBarColor = getOptionValue(options.inactiveBarColor, Defaults.INACTIVE_BAR_COLOR);

		/**
		 * @public
		 * Over bar color 
		 */
		this._options.overBarColor = getOptionValue(options.overBarColor, Defaults.OVER_BAR_COLOR);

		/**
		 * @public
		 * Selection color 
		 */
		this._options.activeBarColor = getOptionValue(options.activeBarColor, Defaults.ACTIVE_BAR_COLOR);

		/**
		 * @public
		 * Selection color 
		 */
		this._options.activeBarColors = getOptionValue(options.activeBarColors, Defaults.ACTIVE_BAR_COLORS);

		/**
		 * @public
		 * Enables bar toggle
		 */
		this._options.enableBarToggle = getOptionValue(options.enableBarToggle, Defaults.ENABLE_BAR_TOGGLE);

		/**
		 * @public
		 * Enables bar hover 
		 */
		this._options.enableBarHover = getOptionValue(options.enableBarHover, Defaults.ENABLE_BAR_HOVER);		

		/**
		 * @public
		 * Allows to set minMax range, default is 'sum' (sum of all data items), can be also 'auto' (min/max based on data)
		 */
		this._options.minMax = getOptionValue(options.minMax, Defaults.MINMAX);		

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
			 * Fires when mouse is out of bar
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

		/**
		 * @private
		 * BarRenderer
		 */
		this._barRenderer = new BarRenderer(this._options);

		this._barRenderer.on("barOver", barIndex=>{
			this._observable.fire("barOver", barIndex);
		})

		this._barRenderer.on("barOut", barIndex=>{
			this._observable.fire("barOut", barIndex);
		})

		this._barRenderer.on("barClick", (barIndex)=>{
			this._observable.fire("barClick", barIndex);
		})

		this._barRenderer.on("barDisabled", (barIndex, disabled)=>{
			this._observable.fire("barDisabled", barIndex, disabled);
		})		
	}

	/**
	 * Bind widget event
	 * @param {String} event event name
	 * @param {Function} handler event handler
	 * @returns {Bar} returns this widget instance
	 */
	on(eventName, handler) {
		this._observable.on(eventName, handler);
		return this;
	}

	/**
	 * Unbind widget event
	 * @param {String} event event name
	 * @param {Function} [handler] event handler
	 * @returns {Bar} returns this widget instance
	 */
	off(eventName, handler) {
		this._observable.off(eventName, handler);
		return this;
	}	

	/**
	 * Destroys widget
	 * @returns {Bar} returns this widget instance
	 */
	destroy() {
		this._observable.destroy();
		this._barRenderer.destroy();
		this._options = null;

		return this;
	}	

	/**
	 * Render logic of this widget
	 * @param {String|DOMElement} selector selector or DOM element 
	 * @returns {Bar} returns this widget instance
	 */
	render(selector) {
		this._barRenderer.render(selector);
		return this;
	}

	/**
	 * Sets widget data
	 * @param {...Array} series
	 * @returns {Bar} returns this widget instance 
	 */
	setData(...series) {
		if (!this._barRenderer.isRendered()) {
			throw "Can't call setData() when widget is not rendered, please call .render() first."
		}

		var barData = this._barData = new BarData(series, this._options);

		if (!this._options.format) {
			this._options.format = d3.format(",." + this._barData.getPrecision() + "f")
		} else if (typeof this._options.format == "string"){
			this._options.format = d3.format(this._options.format);
		}

		this._barRenderer.setData(barData);

		return this;
	}
}

export default Bar;
