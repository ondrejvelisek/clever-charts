
export default class StripeData {

	constructor(
		{
			value,
			color,
			right: {
				value: leftValue,
				color: leftColor
			} = {},
			left: {
				value: rightValue,
				color: rightColor
			} = {}
		}
	) {
		if (typeof value === 'undefined') {
			if (typeof leftValue === 'undefined') throw "value or leftValue is required parameter";
			if (typeof rightValue === 'undefined') throw "value or rightValue is required parameter";

			this._right = {
				value: leftValue,
				color: leftColor
			};
			this._left = {
				value: rightValue,
				color: rightColor
			}
		} else {
			this._value = value;
			this._color = color;
		}
	}

	/**
	 * @param {StripeData} stripeData
	 */
	static copyAs(stripeData) {
		if (stripeData.dual) {
			return new StripeData({
				right: stripeData.right,
				left: stripeData.left
			});
		} else {
			return new StripeData({
				value: stripeData.value,
				color: stripeData.color,
			});
		}
	}

	get dual() {
		return (typeof this._value === 'undefined');
	}

	get value() {
		return this._value;
	}
	set value(value) {
		this._value = value;
	}

	get color() {
		return this._color;
	}
	set color(color) {
		this._color = color;
	}

	get left() {
		return this._left;
	}
	set left(leftData) {
		this._left = leftData;
	}

	get right() {
		return this._right;
	}
	set right(rightData) {
		this._right = rightData;
	}

	calculateMinMax(minMax = "sum") {

		if (this.dual) {
			if (minMax === "sum") {
				return {
					min: Math.min(0, this.left.value, this.right.value),
					max: Math.max(0, this.left.value + this.right.value)
				}
			} else if (minMax === "auto") {
				return {
					min: Math.min(0, this.left.value, this.right.value),
					max: Math.max(0, this.left.value, this.right.value)
				}
			} else {
				return minMax;
			}

		} else {
			if (minMax === "sum" || minMax === "auto") {
				return {
					min: Math.min(0, this.value),
					max: Math.max(0, this.value)
				}
			} else {
				return minMax;
			}
		}
	}

}