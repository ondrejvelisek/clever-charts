
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
			this._data = {
				right: {
					value: leftValue,
					color: leftColor
				},
				left: {
					value: rightValue,
					color: rightColor
				}
			}
		} else {
			this._data = {
				value,
				color
			}
		}
	}

	get dual() {
		return !("value" in this._data);
	}

	_dual() {
		return !("value" in this._data);
	}

	get value() {
		return this._data.value;
	}

	get color() {
		return this._data.color;
	}

	get left() {
		return this._data.left;
	}

	get right() {
		return this._data.right;
	}

	calculateMinMax(minMax = "sum") {

		if (this._dual()) {
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