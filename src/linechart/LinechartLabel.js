import style from "./Linechart.css";
import Component from './Component';
import {LABEL_OFFSET} from './LinechartDefaults';

let gradientID = 0;

class LinechartLabel extends Component {
    constructor() {
        super('linechart-label');
    }

    _setData(container, data, lastData) {
        if (Object.keys(data).length === 1 && typeof data.visible !== 'undefined') {
            return this.container.attr("visibility", data.visible ? "visible" : "hidden");
        }

        this.container.selectAll("*").remove();
        const annotationCircles = data.annotationCircles || [];
        const valueId = data.valueId;
        const newData = Object.assign({}, lastData, data);
        this._renderLabel(newData);
        if (newData.renderDot && annotationCircles.indexOf(valueId) < 0) {
            this._renderCircle(newData);
        }
        this.container.attr("visibility", data.visible ? "visible" : "hidden");
    }

    _renderCircle(data) {
        this.container.append("circle")
            .attr("class", style["label-axis-circle"])
            .attr("stroke-width", 1)
            .attr("cx", data.x)
            .attr("cy", data.y)
            .attr("r", 2.5 + 1/2);
    }

    _renderLabel(data) {
        const labelMask = this.container.append("rect")
            .attr("class", style["tooltip-label-mask"])
            .attr("y", data.y + LABEL_OFFSET - 15)
            .attr("height", 20);

        const label = this.container.append("text")
            .attr("class", style["tooltip-label"])
            .attr("y", data.y + LABEL_OFFSET)
            .text(data.label);

        const bottomLabelWidth = label.node().getComputedTextLength();
        const bottomMaskPadding = 25;
        const textAnchor = this._getTextAnchor(data.x, bottomLabelWidth, data.width);
        const bottomMaskWidth = bottomMaskPadding*2 + bottomLabelWidth;

        this._createMaskGradientElement(this.container, bottomMaskWidth);

        labelMask
            .attr("width", bottomMaskWidth)
            .attr("fill", "url(#"+this.container.select('linearGradient').attr("id")+")")
            .attr("x", -bottomMaskWidth/2)
            .attr("transform", () => {
                return {
                    "start":"translate("+bottomLabelWidth/2+", 0)",
                    "middle":"translate("+data.x+", 0)",
                    "end":"translate("+(data.width-bottomLabelWidth/2)+", 0)"
                }[textAnchor]
            });

        label
            .attr("text-anchor", textAnchor)
            .attr("transform", () => {
                return {
                    "start":"translate(0, 0)",
                    "middle":"translate("+data.x+", 0)",
                    "end":"translate("+data.width+", 0)"
                }[textAnchor]
            });
    }

    _createMaskGradientElement(container, bottomMaskWidth){
        const gradientEdge = 15/bottomMaskWidth;
        const colorWhite = 'rgba(255,255,255,1)';
        const colorTransparent = 'rgba(255,255,255,0)';

        const handleMaskGradientEl = container.append("linearGradient")
            .attr("id", style["tooltip-label-mask"]+"-"+(gradientID++)+"-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("y1", "0").attr("x1", -bottomMaskWidth/2)
            .attr("y2", "0").attr("x2", bottomMaskWidth/2);

        handleMaskGradientEl.selectAll("stop")
            .data([
                { offset: "0", color: colorTransparent},
                { offset: gradientEdge, color: colorWhite},
                { offset: 1 - gradientEdge, color: colorWhite},
                { offset: "1", color: colorTransparent}
            ])
            .enter().append("stop")
            .attr("offset", function (d) { return d.offset; })
            .attr("stop-color", function (d) { return d.color; });
    }

    _getTextAnchor(xPos, bottomLabelWidth, width){
        var xpos = xPos;
        if (xpos - bottomLabelWidth/2 < 0){
            return "start"
        } else if (xpos + bottomLabelWidth/2 > width){
            return "end"
        } else {
            return "middle";
        }
    }

}

export default LinechartLabel;
