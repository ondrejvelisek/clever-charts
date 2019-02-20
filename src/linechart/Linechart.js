import style from "./Linechart.css";
import * as d3 from "d3";
import Component from './Component';
import {
    AXIS_COLOR, HIGHLIGHT_COLOR,
    LABEL_OFFSET,
    LINE_COLOR,
    MARGIN,
    ZERO_LINE_COLOR
} from './LinechartDefaults';
import LinechartMask from './LinechartMask';
import {WIDTH, HEIGHT} from './LinechartDefaults';
import LinechartLabel from './LinechartLabel';
import LinechartTooltip from './LinechartTooltip';
import LinechartLine from './LinechartLine';
import LinechartAnnotation from './LinechartAnnotation';

/**
 * @class
 * Main Linechart class
 * @param {Object} options
 */
class Linechart extends Component {
    constructor({width = WIDTH, height = HEIGHT}) {
        super('linechart');
        this._width = width;
        this._height = height;
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    _renderContainer(selector, x = 0, y = 0){
        this._renderTooltip(selector);
        return d3.select(selector).append("svg")
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("class", style[this.className])
            .attr("transform", `translate(${x}, ${y})`)
    }

    _setData(container, data, lastData) {
        container.selectAll("*").remove();

        const {xAxis, yAxis} = this._getAxes(data.series);

        this._renderZeroLine(container, xAxis, yAxis);
        this._renderXAxis(container, AXIS_COLOR, data.series);
        this._renderLabel(container);
        this._renderAnnotations(container, xAxis, data.annotations);
        this._renderDataLines(container, xAxis, yAxis, data.series);
        this._renderMask(container, data, xAxis, yAxis);
    }

    _getAxes(series) {
        const verticalSpacing = this.height / 4;
        const xAxis = d3.scalePoint().range([0, this.width]);
        const yAxis = d3.scaleLinear().range([this.height-verticalSpacing, verticalSpacing]);
        xAxis.domain(series[0].data.map(function (d) { return d.id; }));
        const minMax = this._calculateMinMax(series);
        yAxis.domain([minMax.min, minMax.max]);
        return {xAxis, yAxis}
    }

    _clearData() {
        this._width = null;
        this._height = null;
        this._tooltip.destroy();
        this._tooltip = null;
        this._label = null;
        this._lines = null;
    }



    ////////////  RENDER FUNCTIONS

    _renderTooltip(selector) {
        this._tooltip = new LinechartTooltip();
        this._tooltip.render(selector);
        this._tooltip.setData({
            html: "",
            x: 0,
            y: 0,
            dark: false,
            visible: false,
            width: this.width
        });
    }

    _renderZeroLine(container, xAxis, yAxis){
        if (this._shouldRenderZeroLine(yAxis)) {
            container.append("line")
                .attr("x1", 0)
                .attr("x2", this.width)
                .attr("y1", Math.round(yAxis(0)))
                .attr("y2", Math.round(yAxis(0)))
                .attr("stroke-dasharray","2 ,2")
                .attr("stroke", ZERO_LINE_COLOR)
        }
    }

    _renderXAxis(container, axisColor, series) {
        container.append("line")
            .attr("x1", 0)
            .attr("x2", this.width)
            .attr("y1", this.height-MARGIN)
            .attr("y2", this.height-MARGIN)
            .attr("stroke-width", 1)
            .attr("stroke", axisColor);

        // render to labels on start and end sides if multiple items are available
        if (series[0].data.length>1){
            container.append("text")
                .text(series[0].data[0].label)
                .attr("x", 0)
                .attr("y", this.height - MARGIN + LABEL_OFFSET)

            container.append("text")
                .text(series[0].data[series[0].data.length-1].label)
                .attr("x", this.width)
                .attr("text-anchor", "end")
                .attr("y", this.height - MARGIN + LABEL_OFFSET)

            // render single label in the middle if only one item is available
        } else if (series[0].data.length == 1){
            container.append("text")
                .text(series[0].data[0].label)
                .attr("x", this.width/2)
                .attr("text-anchor", "middle")
                .attr("y", this.height - MARGIN + LABEL_OFFSET)
        }
    }

    _renderLabel(container) {
        this._label = new LinechartLabel();
        this._label.render(container.node());
        this._label.setData({
            x: 0,
            y: this.height - MARGIN,
            width: 360,
            label: "",
            visible: false,
            renderDot: true
        });
    }

    _renderAnnotations(container, xAxis, annotations) {
        const mergedAnnotations = this._mergeAnnotations(annotations);

        this._annotations = Object.keys(mergedAnnotations).map(id => {
            if (typeof xAxis(id) === 'undefined') {
                console.warn(`Annotation (in presentation component) ${JSON.stringify(mergedAnnotations[id])} has id '${id}' which is not present in linechart data`);
                return;
            }
            const annotation = new LinechartAnnotation();
            annotation.render(this.container.node());
            annotation.setData({
                xAxis,
                id,
                height: this.height,
                length: mergedAnnotations[id].length,
                highlight: false
            });
            return annotation;
        });
    }

    _renderDataLines(container, xAxis, yAxis, series) {
        this._lines = Array.from(series).reverse().map(lineData => {
            const line = new LinechartLine();
            line.render(this.container.node());
            line.setData({
                height: this.height,
                xAxis,
                yAxis,
                lineData: lineData.data,
                appearance: lineData.appearance,
                renderAreas: true,
                point: null
            });
            return line;
        });
        this._lines.reverse();
    }

    _renderMask(container, data, xAxis, yAxis) {
        const mask = new LinechartMask(this.width, this.height);
        mask.render(container.node());
        mask.on('lineEnter', (lineData, lineIndex) => {
            this._onLineEnter(container, lineData, lineIndex);
        }).on('lineLeave', (lineData, lineIndex) => {
            this._onLineLeave(container, lineData, lineIndex);
        }).on('tooltipEnter', (valueData, valueLabel) => {
            this._onValueEnter(xAxis, yAxis, valueData, valueLabel);
        }).on('tooltipLeave', (valueData, valueLabel) => {
            this._onValueLeave(xAxis, yAxis, valueData, valueLabel);
        }).on('annotationEnter', (annotationData, valueData, annotationId, annotationIndex) => {
            this._onAnnotationEnter(container, xAxis, annotationData, valueData, annotationId, annotationIndex);
        }).on('annotationLeave', (annotationData, valueData, annotationId, annotationIndex) => {
            this._onAnnotationLeave(container, xAxis, annotationData, valueData, annotationId, annotationIndex);
        }).on('leave', () => {
            this._onLeave();
        });
        mask.setData(data);
    }



    ////////////  CALLBACK FUNCTIONS

    _onAnnotationEnter(container, xAxis, annotationData, valueData, annotationId, annotationIndex) {
        this._annotations[annotationIndex].setData({
            highlight: true
        });

        this._label.setData({
            x: xAxis(annotationId),
            label: valueData[0].label,
            visible: true,
            renderDot: annotationData.length <= 1
        });

        const coord = d3.mouse(container.node());
        this._tooltip.setData({
            html: this._getAnnotationHTML(annotationData),
            x: coord[0],
            y: coord[1],
            dark: true,
            visible: true
        });
    }

    _onAnnotationLeave(container, xAxis, annotationData, valueData, annotationId, annotationIndex) {
        this._annotations[annotationIndex].setData({
            highlight: false
        });
    }

    _onValueEnter(xAxis, yAxis, valueData, valueId) {
        this._lines.forEach(line => line.setData({
            point: valueId
        }));

        this._label.setData({
            x: xAxis(valueId),
            label: valueData[0].label,
            visible: true,
            renderDot: true
        });

        let hasTooltips = false;
        valueData.forEach(lineData => lineData.tooltip && (hasTooltips = true));
        if (hasTooltips) {
            this._tooltip.setData({
                html: this._getValueTooltipHTML(valueData),
                x: xAxis(valueId),
                y: yAxis(Math.max.apply(Math, valueData.map(item => item.value))),
                dark: false,
                visible: true
            });
        } else {
            this._tooltip.setData({
                visible: false
            });
        }
    }

    _onValueLeave() {
        this._lines.forEach(line => line.setData({
            point: null
        }));
    }

    _onLineEnter(container, lineData, lineIndex) {
        const coord = d3.mouse(container.node());
        this._tooltip.setData({
            html: lineData.title,
            x: coord[0],
            y: coord[1],
            dark: true,
            visible: true
        });

        const highlightAppearance = Object.assign({}, lineData.appearance, {
            lineColor: HIGHLIGHT_COLOR,
            fillColor: HIGHLIGHT_COLOR
        });
        this._lines[lineIndex].setData({
            appearance: highlightAppearance
        });

        this._label.setData({
            visible: false
        });
    }

    _onLineLeave(container, lineData, lineIndex) {
        this._lines[lineIndex].setData({
            appearance: lineData.appearance
        });
    }

    _onLeave() {
        this._label.setData({
            visible: false
        });
        this._tooltip.setData({
            visible: false
        });
    }



    ////////////  UTILS FUNCTIONS

    _getValueTooltipHTML(data){
        return data.filter(item => item.value != null).map(item => {
            const value = item.tooltip || item.value;

            if (data.length>1){
                const color = item.appearance.lineColor || LINE_COLOR;
                const icon = `
				    <span style="display:inline-block;position:relative;top:-1px;margin-right:5px;width:6px;height:6px;border-radius:50%;background-color:${color}"></span>
			    `;
                return icon + value;
            } else {
                return value;
            }
        }).join("<br />");
    }

    _getAnnotationHTML(data){
        return data.map(annotation => {
            return `<span style="font-weight: bold">${annotation.title}</span><br/><span>${annotation.subtitle}</span>`
        }).join("<hr />");
    }

    _mergeAnnotations(annotations) {
        const merged = {};

        annotations.forEach(annotation => {
            merged[annotation.id] = merged[annotation.id] || [];
            merged[annotation.id].push(annotation);
        });
        return merged;
    }

    _shouldRenderZeroLine(yAxis){
        const zeroLinePosition = yAxis(0);
        const axisPosition = this.height - MARGIN;
        const treshold = 10;
        return zeroLinePosition < axisPosition - treshold && zeroLinePosition > 0;
    }

    _calculateMinMax(series) {
        const data = [];
        series.forEach((line) => {
            line.data.forEach((item) => {
                data.push(item);
            });
        });

        var min = d3.min(data, function (d) { return d.value; });
        var max = d3.max(data, function (d) { return d.value; });

        if (data.length <= series.length) {
            min = Math.min(min, 0);
            max = Math.max(max, 0);
        }

        return {
            min: min,
            max: max
        }
    }


}

export default Linechart;
