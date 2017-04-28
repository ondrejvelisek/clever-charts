import * as d3 from "d3";
import style from "./Histogram.css";
import { Observable } from "./utils/Observable.js";

/**
 * @class
 * HistogramHandle representing control handle for histogram
 */
class HistogramHandle {
	/**
	 * @param {D3Selection} groupEl
	 * @param {Number} value
	 * @param {Number} index
	 * @param {HistoryData} histogramData
	 * @param {Object} options
	 */
	constructor(groupEl, value, index, histogramData, options) {
		/**
		 * @private
		 * observable handler
		 */
		this._observable = new Observable([
			/**
			 * @event 
			 * Fires when mouse is over a category
			 * @param {int} categoryIndex
			 */
			"drag"
		]);

		this._groupEl = groupEl;
		this._options = options;
		this._histogramData = histogramData;
		this._renderHandle(value, index);
	}

	/**
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
	   * Renders drag handle
	   * @param {Number} value
	   * @param {Number} index
	   * TODO: break down this method 
	   */
	_renderHandle(value, handleIndex) {
		var data = this._histogramData;
		var position = data.valueToPosition(value);
		var height = this._options.height;
		var width = this._options.width;
		var g = this._groupEl;
		var format = this._options.format;
		var maskPadding = this._options.maskPadding;
		var observable = this._observable;

		// handle
		var handle = g.append("rect")
			.attr("class", style["custom-handle"])
			.attr("fill-opacity", 0)
			.attr("data-handle-index", handleIndex)
			.attr("data-handle-value", value)
			.attr("cursor", "ew-resize")
			.attr("width", 10)
			.attr("height", height + 5)
			.attr("x", position - 5);

		// handle line decorator
		var line = g.append("rect")
			.attr("class", style["custom-handle-line"])
			.attr("width", 4)
			.attr("height", height)
			.attr("fill-opacity", 0)
			.attr("x", position - 2);

		// circle decorator
		var circle = g.append("circle")
			.attr("class", style["custom-handle-circle"])
			.attr("transform", "translate(" + position + "," + height + ")")
			.attr("fill", "#ffffff")
			.attr("fill-opacity", 1)
			.attr("stroke", "#000")
			.attr("stroke-width", 1)
			.attr("cursor", "ew-resize")
			.attr("r", 3.5);


		// drag mask, we need this in order to mask min/max values when drag label is over min/max labels
		var dragMask = g.append("rect")
			.attr("class", style["drag-label-mask"])
			.attr("fill", "url(#brush-mask-gradient-" + handleIndex + ")")
			.attr("y", height + 12)
			.attr("visibility", "hidden");

		var maskGradient = g.append("linearGradient")
			.attr("id", "brush-mask-gradient-" + handleIndex)
			.attr("gradientUnits", "userSpaceOnUse")
			.attr("y1", 0).attr("x1", 50)
			.attr("y2", 0).attr("x2", 0);

		maskGradient.selectAll("stop")
			.data([
				{ offset: "0%", color: "rgba(255,255,255,0)" },
				{ offset: "10%", color: "rgba(255,255,255,1)" },
				{ offset: "90%", color: "rgba(255,255,255,1)" },
				{ offset: "100%", color: "rgba(255,255,255,0)" }
			])
			.enter().append("stop")
			.attr("offset", function (d) { return d.offset; })
			.attr("stop-color", function (d) { return d.color; });

		// drag label
		var dragLabel = g.append("text")
			.attr("class", style["drag-label"])
			.attr("fill-opacity", 0)
			.text(() => {
				return format(data.positionToValue(position));
			}).attr("x", function () {
				return updateLabelPosition(this, position);
			}).attr("y", height + 22);

		// handle hover state
		var isOver = false;
		function setOverState() {
			line.attr("fill-opacity", 1);
			dragLabel.attr("fill-opacity", 1);
			dragMask.attr("visibility", "visible");
			circle.attr("r", 4.5).attr("stroke-width", 3);
		}

		function unsetOverState() {
			line.attr("fill-opacity", 0);
			dragLabel.attr("fill-opacity", 0);
			dragMask.attr("visibility", "hidden");
			circle.attr("r", 3.5).attr("stroke-width", 1);
		}

		// line hover effect
		handle.on("mouseover", () => {
			isOver = true;
			setOverState();
		})
		handle.on("mouseout", () => {
			isOver = false;
			unsetOverState();
		})

		// handle drag
		handle.call(d3.drag()
			.on("drag", drag)
			.on("start", startdrag)
			.on("end", enddrag));

		function startdrag() {
			g.classed(style["dragging"], true);
			var s = "." + ["custom-handle", "custom-handle-circle", "custom-handle-line", "bar", "selectionbar"].map(cls => style[cls]).join(", .");
			g.selectAll(s).attr("pointer-events", "none");

			handle.attr("pointer-events", "all");
			line.attr("pointer-events", "all");
			circle.attr("pointer-events", "all");
		}

		function enddrag() {
			g.classed(style["dragging"], false);
			var s = "." + ["custom-handle", "custom-handle-circle", "custom-handle-line", "bar", "selectionbar"].map(cls => style[cls]).join(", .");
			g.selectAll(s).attr("pointer-events", "all");

			if (!isOver) {
				unsetOverState();
			}
		}

		function updateLabelPosition(label, position) {
			// we need to calculate text length so we can create mask and center text
			var textLength = label.getComputedTextLength();
			var maskWidth = textLength + maskPadding * 2;
			var xPosition = position - textLength / 2;

			// handle when dragging towards left side
			if (xPosition < 0) {
				xPosition = 0.5;
			}

			// handle when dragging towards right side
			if (xPosition + textLength > 360) {
				xPosition = 360 - textLength + 0.5;
			}

			// position mask
			dragMask.attr("x", () => {
				return parseInt(xPosition) - maskPadding;
			});

			maskGradient.attr("x1", xPosition - maskPadding);
			maskGradient.attr("x2", xPosition + maskWidth - maskPadding);

			dragMask.attr("width", maskWidth);
			dragMask.attr("height", 20);

			// position text
			return xPosition;
		}

		function drag() {
			var xpos = Math.round(Math.max(Math.min(d3.event.x, width), 0));
			handle.attr("x", xpos - 5);
			line.attr("x", xpos - 2);
			circle.attr("transform", "translate(" + xpos + "," + height + ")");
			handle.attr("data-handle-value", data.positionToValue(xpos))

			setOverState();

			observable.fire("drag");

			dragLabel.text(() => {
				return format(data.positionToValue(xpos));
			}).attr("x", function () {
				return updateLabelPosition(this, xpos);
			});
		}
	}
}

export { HistogramHandle };