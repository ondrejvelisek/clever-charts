import style from "../Barchart.css";
import * as d3 from "d3";
import Observable from "../../utils/Observable";

let MASK_INDEX = 0;

class Component {

	constructor(
			width,
			height,
			className = "component",
			alignRight = false,
			alignBottom = false
	) {
		this._width = width;
		this._height = height;
		this._container = null;
		this._maskIndex = MASK_INDEX++;
		this._className = className;
		this._observable = new Observable([
			"enter",
			"leave",
			"click"
		]);
		this._alignRight = alignRight;
		this._alignBottom = alignBottom;
	}

	on(eventName, handler) {
		this._observable.on(eventName, handler);
		return this;
	}

	off(eventName, handler) {
		this._observable.off(eventName, handler);
		return this;
	}

	get width() {
		return this._width;
	}

	get height() {
		return this._height;
	}

	get className() {
		return this._className;
	}

	get container() {
		return this._container;
	}

	get alignRight() {
		return this._alignRight;
	}

	get alignBottom() {
		return this._alignBottom;
	}

	set width(value) {
		this._width = value;
		if (this.isRendered()) {
			this._container.select(`.${style["clickable-area"]}`).attr("width", value);
		}
		if (this.alignRight) {
			this._container.select(`.${style["clickable-area"]}`).attr("x", -value);
		}
	}

	set height(value) {
		this._height = value;
		if (this.isRendered()) {
			this._container.select(`.${style["clickable-area"]}`).attr("height", value);
		}
		if (this.alignBottom) {
			this._container.select(`.${style["clickable-area"]}`).attr("y", -value);
		}
	}

	_renderContainer(selector, x = 0, y = 0){

		return d3.select(selector).append("g")
			.attr("class", style[this.className])
			.attr("transform", `translate(${x}, ${y})`)

	}

	render(selector, x = 0, y = 0, index = 0){
		this.destroy();

		this._container = this._renderContainer(selector, x, y);

		this._container.datum(index);

		this._container
			.on("click", (index) => {
				this._observable.fire("click", index)
			})
			.on("mouseenter", (index) => {
				this._observable.fire("enter", index)
			})
			.on("mouseleave", (index) => {
				this._observable.fire("leave", index)
			});

		if (!this._container) {
			throw `Component ${this._className} was not rendered. Check your selector: ${selector}`;
		}

		// clickable area
		const clickableArea = this._container.append("rect")
			.attr("class", style["clickable-area"])
			.attr("fill", "transparent")
			.attr("width", this.width)
			.attr("height", this.height);

		if (this.alignBottom) {
			clickableArea.attr("y", -this.height);
		}
		if (this.alignRight) {
			clickableArea.attr("x", -this.width);
		}

		this._render(index);

		return this;
	}

	_render(index){
		// prepared to be implemented by subclasses
	}

	destroy(){
		if (this.isRendered()) {
			this.clearData();
			this._container.datum(null);
			this._container.remove();
			this._container = null;
		}
		return this;
	}

	isRendered(){
		return this._container !== null;
	}

	setData(data) {
		if (!this.isRendered()) {
			throw "Can't call setData() when component is not rendered, please call .render() first."
		}
		this._setData(data);
		this._data = data;
		return this;
	}

	clearData() {
		if (!this.isRendered()) {
			throw "Can't call clearData() when widget is not rendered, please call .render() first."
		}
		this._data = null;
		this._clearData();
		return this;
	}

	_setData(data) {
		// prepared to be implemented by subclasses
	}

	_clearData() {
		// prepared to be implemented by subclasses
	}
}

export default Component;
