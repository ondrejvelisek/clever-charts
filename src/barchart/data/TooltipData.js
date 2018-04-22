export default class TooltipData {

	constructor(
		{
			text,
			symbol,
			color
		}
	) {
		if (typeof text === 'undefined') throw "text is required parameter";
		this._symbol = symbol;
		this._color = color;
		this._text = text;
	}

	get symbol() {
		return this._symbol;
	}

	get color() {
		return this._color;
	}

	get text() {
		return this._text;
	}

	getPrecision(precision = "max") {
		if (precision === "max") {
			if (this.isNumber()) {
				const str = this.text.toString();
				if (str.includes('.')) {
					return str.split(".")[1].length;
				} else {
					return 0;
				}
			} else {
				return 0;
			}
		} else {
			return precision;
		}
	}

	isNumber() {
		return !isNaN(parseFloat(this.text)) && isFinite(this.text);
	}

}