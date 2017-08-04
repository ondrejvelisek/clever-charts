import Observable from "../utils/Observable";
import * as Defaults from "./DoughnutDefaults";
import DoughnutRenderer from "./DoughnutRenderer";

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
 * Main doughnut class
 * @param {Object} options
 */
class Doughnut {
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
		this._options.outerRadius = getOptionValue(options.outerRadius, Defaults.OUTER_RADIUS);

		/**
		 * @public
		 * Width of the widget
		 */
		this._options.innerRadius = getOptionValue(options.innerRadius, Defaults.INNER_RADIUS);

		/**
		 * @public
		 * Active color
		 */
		this._options.activeColor = getOptionValue(options.activeColor, Defaults.ACTIVE_COLOR);

		/**
		 * @public
		 * Inactive color
		 */
		this._options.inactiveColor = getOptionValue(options.inactiveColor, Defaults.INACTIVE_COLOR);

		/**
		 * @public
		 * Inactive color
		 */
		this._options.backgroundColor = getOptionValue(options.backgroundColor, Defaults.BACKGROUND_COLOR);

		/**
		 * @public
		 * Value
		 */
		this._options.value = getOptionValue(options.value, Defaults.VALUE);

		/**
		 * @public
		 * Animation duration
		 */
		this._options.animationDuration = getOptionValue(options.animationDuration, Defaults.ANIMATION_DURATION);

		/**
		 * @public
		 * Render to container
		 */
		this._options.renderTo = getOptionValue(options.renderTo, null);		

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

		/**
		 * @private
		 * DoughnutRenderer
		 */
		this._doughnutRenderer = new DoughnutRenderer(this._options);

		this._doughnutRenderer.on("mouseOver", ()=>{
			this._observable.fire("mouseOver")
		});

		this._doughnutRenderer.on("mouseOut", ()=>{
			this._observable.fire("mouseOut")
		});

		if (options.renderTo){
			this.render(options.renderTo);
		}
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
	 * Destroys widget
	 * @returns {Doughnut} returns this widget instance
	 */
	destroy() {
		this._observable.destroy();
		this._doughnutRenderer.destroy();
		this._options = null;

		return this;
	}	

	/**
	 * Render logic of this widget
	 * @param {String|DOMElement} selector selector or DOM element 
	 * @returns {Doughnut} returns this widget instance
	 */
	render(selector) {
		this._doughnutRenderer.render(selector);
		return this;
	}

	/**
	 * Sets widget data
	 * @param {Object} options
	 * @returns {Doughnut} returns this widget instance 
	 */
	update(options) {
		if (!this._doughnutRenderer.isRendered()) {
			throw "Can't call update() when widget is not rendered, please call .render() first."
		}

		this._doughnutRenderer.update(options);

		return this;
	}
}

export default Doughnut;
