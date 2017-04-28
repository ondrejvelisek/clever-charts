import * as d3 from "d3";
import { Observable } from "./utils/Observable";
import * as Defaults from "./HistogramDefaults";
import * as SelectionUtils from "./utils/SelectionUtils";
import { HistogramData } from "./HistogramData";
import { HistogramSelection } from "./HistogramSelection";
import { HistogramRenderer } from "./HistogramRenderer";

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
 * Main histogram class
 * @param {Object} options
 */
class Histogram {
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
		 * Margin of the widget
		 */
		this._options.margin = getOptionValue(options.margin, Defaults.MARGIN);

		/**
		 * @public
		 * Format for widget labels 
		 */
		this._options.format = getOptionValue(options.format, null);

		/**
		 * @public
		 * Inactive bar color 
		 */
		this._options.inactiveBarColor = getOptionValue(options.inactiveBarColor, Defaults.INACTIVE_BAR_COLOR);

		/**
		 * @public
		 * Over bar color 
		 */
		this._options.overSelectionColor = getOptionValue(options.overSelectionColor, Defaults.OVER_SELECTION_COLOR);

		/**
		 * @public
		 * Mask padding
		 */
		this._options.maskPadding = getOptionValue(options.maskPadding, Defaults.MASK_PADDING);

		/**
		 * @public
		 * selection array
		 */
		this._options.selection = getOptionValue(options.selection, null);

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
			"selectionOver",
			,
			/**
			 * @event 
			 * Fires when selection is toggled
			 * @param {int} selectionIndex
			 * @param {bool} enabled
			 */
			"toggleSelection"
		]);

		/**
		 * @private
		 * histogramRenderer
		 */
		this._histogramRenderer = new HistogramRenderer(this._options);

		this._histogramRenderer.on("selectionOver", selectionIndex=>{
			this._observable.fire("selectionOver", selectionIndex);
		})

		this._histogramRenderer.on("toggleSelection", (selectionIndex, enabled)=>{
			this._observable.fire("toggleSelection", selectionIndex, enabled);
		})
	}

	/**
	 * Bind widget event
	 * @param {String} event event name
	 * @param {Function} handler event handler
	 * @returns {Histogram} returns this widget instance
	 */
	on(eventName, handler) {
		this._observable.on(eventName, handler);
		return this;
	}

	/**
	 * Render logic of this widget
	 * @param {String|DOMElement} selector selector or DOM element 
	 * @returns {Histogram} returns this widget instance
	 */
	render(selector) {
		this._histogramRenderer.render(selector);
		return this;
	}

	/**
	 * Sets widget data
	 * @param {Array} data
	 * @returns {Histogram} returns this widget instance 
	 */
	setData(data) {
		if (!this._histogramRenderer.isRendered()) {
			throw "Can't call setData() when widget is not rendered, please call .render() first."
		}

		var histogramData = new HistogramData(data, this._options);

		if (!this._options.selection) {
			this._options.selection = SelectionUtils.getDefaultSelection(histogramData);
		}

		if (!this._options.format) {
			this._options.format = d3.format("." + histogramData.getPrecision() + "f")
		}

		var histogramSelection = new HistogramSelection(this._options.selection);

		this._histogramRenderer.refresh(histogramData, histogramSelection);

		return this;
	}

}

export default Histogram;