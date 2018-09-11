import * as Defaults from "../defaults/BarchartDefaults";
import Component from "./Component";
import style from "../Barchart.css";

// note: Currently unused
class Hover extends Component {

	constructor(
		{
			width = Defaults.WIDTH,
			height = Defaults.BAR_HEIGHT
		}
	) {
		super(width, height, "hover");

		this._observable
			.add("leftEnter")
			.add("leftLeave")
			.add("rightEnter")
			.add("rightLeave")
			.add("middleEnter")
			.add("middleLeave");
	}

	_render() {
		// Thirds hover
		this.container.append("rect")
			.attr("class", style["bar-left"])
			.attr("fill", "transparent")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", this.width/3)
			.attr("height", this.height)
			.on("mouseenter", () => {
				this._observable.fire("leftEnter", this.container.datum());
			})
			.on("mouseleave", () => {
				this._observable.fire("leftLeave", this.container.datum());
			});

		this.container.append("rect")
			.attr("class", style["bar-middle"])
			.attr("fill", "transparent")
			.attr("x", this.width/3)
			.attr("y", 0)
			.attr("width", this.width/3)
			.attr("height", this.height)
			.on("mouseenter", () => {
				this._observable.fire("middleEnter", this.container.datum());
			})
			.on("mouseleave", () => {
				this._observable.fire("middleLeave", this.container.datum());
			});

		this.container.append("rect")
			.attr("class", style["bar-right"])
			.attr("fill", "transparent")
			.attr("x", this.width*(2/3))
			.attr("y", 0)
			.attr("width", this.width/3)
			.attr("height", this.height)
			.on("mouseenter", () => {
				this._observable.fire("rightEnter", this.container.datum());
			})
			.on("mouseleave", () => {
				this._observable.fire("rightLeave", this.container.datum());
			});
	}

}

export default Hover;
