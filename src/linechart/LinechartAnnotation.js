import style from "./Linechart.css";
import Component from './Component';
import {HIGHLIGHT_COLOR, MARGIN} from './LinechartDefaults';

class LinechartAnnotation extends Component {
    constructor() {
        super('linechart-annotation');
    }

    _setData(container, data, lastData) {
        if (Object.keys(data).length === 1 && typeof data.highlight !== 'undefined') {
            return this._updateAppearance(data.highlight);
        }

        this.container.selectAll("*").remove();
        this._annotation = this._renderAnnotation(data);
        return this._updateAppearance(data.highlight);
    }

    _updateAppearance(highlight) {
        this._annotation.line.attr("stroke", highlight ? HIGHLIGHT_COLOR : "#8f959c");
        if (this._annotation.circle) {
            this._annotation.circle.attr("fill", highlight ? HIGHLIGHT_COLOR : "#8f959c");
        }
        if (this._annotation.text) {
            this._annotation.text.classed(style['white-fill'], !highlight);
        }
    }

    _renderAnnotation({xAxis, id, height, length}) {
        const annotationGroup = {};
        annotationGroup.line = this.container.append("line")
            .attr("x1", xAxis(id))
            .attr("x2", xAxis(id))
            .attr("y1", 0)
            .attr("y2", height - MARGIN)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray","2 ,2");

        if (length > 1) {
            annotationGroup.circle = this.container.append("circle")
                .attr("cx", xAxis(id))
                .attr("cy", height - MARGIN)
                .attr("r", 7.5)
            annotationGroup.text = this.container.append("text")
                .attr("x", xAxis(id))
                .attr("y", height - MARGIN + 4)
                .attr("text-anchor", "middle")
                .text(length);
        }
        return annotationGroup;
    }

}

export default LinechartAnnotation;
