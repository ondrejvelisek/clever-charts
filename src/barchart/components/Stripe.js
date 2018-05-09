import * as Defaults from "../defaults/BarchartDefaults";
import Component from "./Component";
import * as d3 from "d3";
import style from "../Barchart.css";

let COLOR_PATTERN_INDEX = 0;

class Stripe extends Component {

	constructor(
		{
			width = Defaults.WIDTH,
			height = Defaults.STRIPE_HEIGHT,
			backgroundColor = Defaults.STRIPE_BACKGROUND_COLOR,
			activeColors = Defaults.ACTIVE_COLORS,
			dualValue = Defaults.DUAL_VALUE,
			minMax = Defaults.MINMAX,
			topCornerRounded = Defaults.CORNER_ROUNDED,
			bottomCornerRounded = Defaults.CORNER_ROUNDED,
		}) {
		super(width, height, "stripe");
		this._backgroundColor = backgroundColor;
		this._activeColors = activeColors;
		this._dualValue = dualValue;
		this._minMax = minMax;
		this._topCornerRounded = topCornerRounded;
		this._bottomCornerRounded = bottomCornerRounded;
	}

	get dualValue() {
		return this._dualValue;
	}

	get backgroundColor() {
		return this._backgroundColor;
	}

	get activeColors() {
		return this._activeColors;
	}

	get minMax() {
		return this._minMax;
	}

	get topCornerRounded() {
		return this._topCornerRounded;
	}

	get bottomCornerRounded() {
		return this._bottomCornerRounded;
	}

	_render() {

		const clipPath = this.container.append("clipPath")
			.attr("id", "rounded-corners-"+this._maskIndex);

		clipPath
			.append("rect")
			.attr("width", this.width)
			.attr("height", this.height)
			.attr("rx", Math.min(this.width, this.height)/2)
			.attr("ry", Math.min(this.width, this.height)/2);

		if (!this.topCornerRounded) {
			clipPath
				.append("rect")
				.attr("y", 0)
				.attr("width", this.width)
				.attr("height", this.height/2);
		}
		if (!this.bottomCornerRounded) {
			clipPath
				.append("rect")
				.attr("y", this.height/2)
				.attr("width", this.width)
				.attr("height", this.height/2);
		}

		this._renderProgress(0, this.width, this.backgroundColor, "stripe-background");
	}

	/**
	 * @param {StripeData} data
	 */
	_setData(data) {

		if (this.dualValue) {

			this._renderStripe(0, this.width/2-0.5,
				data.left.value,
				data.left.color ? data.left.color : this.activeColors[1] ? this.activeColors[1] : this.activeColors[0],
				true
			);
			this._renderStripe(this.width/2+0.5, this.width,
				data.right.value,
				data.right.color ? data.right.color : this.activeColors[0],
				false
			);

		} else {
			this._renderStripe(0, this.width, data.value, data.color ? data.color : this.activeColors[0]);
		}
	}

	_clearData() {
		this.container.selectAll(style["progress"]).remove();
	}


	_renderXBase(x) {

		this.container.append("line")
			.attr("x1", x)
			.attr("x2", x)
			.attr("y1", 0)
			.attr("y2", -4)
			.attr("stroke", "#C9C9C9")
			.attr("stroke-width", 1)
			.attr("stroke-dasharray", [1,2]);

		this.container.append("line")
			.attr("x1", x)
			.attr("x2", x)
			.attr("y1", this.height)
			.attr("y2", this.height + 4)
			.attr("stroke", "#C9C9C9")
			.attr("stroke-width", 1)
			.attr("stroke-dasharray", [1,2]);
	}

	_renderStripe(x1, x2, value, color, alignRight = false) {

		const axis = d3.scaleLinear()
			.range([x1, x2]);

		if (alignRight) {
			axis.domain([this.minMax.max, this.minMax.min]);
		} else {
			axis.domain([this.minMax.min, this.minMax.max]);
		}

		const xBase = axis(0);

		if (this.minMax.min < 0 && this.minMax.max > 0) {
			this._renderXBase(xBase);
		}

		if (alignRight === value < 0) {

			this._renderProgress(xBase, axis(value), color);

		} else {

			this._renderProgress(axis(value), xBase, color);

		}

	}

	_renderProgress(x1, x2, color, className = "progress") {

		if (color instanceof Array) {
			this._renderTwoColoredFill(color[0], color[1]);
		}

		this.container.append("rect")
			.attr("fill", color instanceof Array ? "url(#two-colored-"+this._maskIndex+"-"+COLOR_PATTERN_INDEX+")" : color)
			.attr("class", style[className])
			.attr("x", x1)
			.attr("y", 0)
			.attr("width", x2-x1)
			.attr("height", this.height)
			.attr("transform", "translate(" + 0 + ", " + 0 + ")")
			.attr("clip-path", "url(#rounded-corners-"+this._maskIndex+")");

	}

	_renderTwoColoredFill(color1, color2) {

		COLOR_PATTERN_INDEX++;

		const twoColoredFill = this.container.append("pattern")
			.attr("id", "two-colored-"+this._maskIndex+"-"+COLOR_PATTERN_INDEX)
			.attr("width", "20")
			.attr("height", "20")
			.attr("patternUnits", "userSpaceOnUse");

		twoColoredFill.append('rect')
			.attr('fill', color1)
			.attr("width", "20")
			.attr("height", "20");

		twoColoredFill.append('path')
			.attr('fill', color2)
			.attr('d', 'M20,0 L10,0 L20,10 Z');
		twoColoredFill.append('path')
			.attr('fill', color2)
			.attr('d', 'M0,0 L20,20 L10,20 L0,10 Z');
	}


}

export default Stripe;
