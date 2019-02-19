import style from "./Linechart.css";
import Component from './Component';
import * as d3 from 'd3';

class LinechartTooltip extends Component {
    constructor() {
        super('linechart-tooltip');
    }

    _renderContainer(selector, x = 0, y = 0){
        // force position relative so the toolip shows correctly
        d3.select(selector).style("position", "relative");

        return d3.select(selector).insert("span", ":first-child")
            .attr("class", style["tooltip-top-label"])
            .style("position", "absolute")
            .style("visibility", "hidden");
    }

    _setData(container, data, lastData) {
        const newData = Object.assign({}, lastData, data);
        this._renderTooltip(newData);
    }

    _renderTooltip(data) {
        this.container.node().innerHTML = data.html;
        this.container
            .style("left", `${this._getLabelLeft(data.x, data.width)}px`)
            .style("top", `${data.y - 12 - this.container.node().offsetHeight}px`)
            .style("visibility", data.visible ? "visible" : "hidden")
            .classed(style["dark"], data.dark);
    }

    _getLabelLeft(xPos, width){
        const labelWidth = this.container.node().offsetWidth;
        let labelLeft = xPos-labelWidth/2;

        if (labelLeft<0){
            labelLeft = 0;
        }

        if (labelLeft > width - labelWidth){
            labelLeft = width - labelWidth;
        }

        return labelLeft;
    }
}

export default LinechartTooltip;
