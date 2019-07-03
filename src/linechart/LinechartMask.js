import style from "./Linechart.css";
import * as d3 from "d3";
import Component from './Component';
import {DOT_SIZE, LINE_WIDTH, MARGIN_TOP, MARGIN_BOTTOM} from './LinechartDefaults';
import LinechartLine from './LinechartLine';

class LinechartMask extends Component {

    constructor(width, height) {
        super('linechart-mask');
        this._width = width;
        this._height = height;
        this.observable.add('lineEnter');
        this.observable.add('lineLeave');
        this.observable.add('tooltipEnter');
        this.observable.add('tooltipLeave');
        this.observable.add('annotationEnter');
        this.observable.add('annotationLeave');
    }

    get width() {
        return this._width;
    }

    get height() {
        return this._height;
    }

    _setData(container, data, lastData) {
        const verticalSpacing = this.height / 4;
        const xAxis = d3.scalePoint().range([0, this.width]);
        const yAxis = d3.scaleLinear().range([this.height-verticalSpacing, MARGIN_TOP]);
        xAxis.domain(data.series[0].data.map(function (d) { return d.id; }));
        const minMax = this._calculateMinMax(data.series);
        yAxis.domain([minMax.min, minMax.max]);
        const mergedData = this._mergeSeriesData(data.series);
        this._renderTooltipAreas(container, xAxis, yAxis, mergedData);
        this._renderTooltipLines(container, xAxis, yAxis, data.series);
        this._renderAnnotations(container, xAxis, data.annotations, mergedData);
    }

    _renderAnnotations(container, xAxis, annotations, mergedData) {
        const mergedAnnotations = this._mergeAnnotations(annotations);

        Object.keys(mergedAnnotations).forEach((id, index) => {
            if (typeof xAxis(id) === 'undefined') {
                console.warn(`Annotation (in mask component) ${JSON.stringify(mergedAnnotations[id])} has id '${id}' which is not present in linechart data`);
                return;
            }
            const annotationGroup = container.append("g")
                .on("mouseenter", () => this.observable.fire("annotationEnter", mergedAnnotations[id], mergedData[id], id, index))
                .on("mouseleave", () => this.observable.fire("annotationLeave", mergedAnnotations[id], mergedData[id], id, index));
            annotationGroup.append("line")
                .attr("x1", xAxis(id))
                .attr("x2", xAxis(id))
                .attr("y1", 0)
                .attr("y2", this.height - MARGIN_BOTTOM)
                .attr("stroke-width", 3)
                .attr("stroke", 'transparent');
            if (mergedAnnotations[id].length > 1) {
                annotationGroup.append("circle")
                    .attr("fill", "transparent")
                    .attr("cx", xAxis(id))
                    .attr("cy", this.height - MARGIN_BOTTOM)
                    .attr("r", 7.5);
            }
        });
    }

    _mergeAnnotations(annotations) {
        const merged = {};
        annotations.forEach(annotation => {
            merged[annotation.id] = merged[annotation.id] || [];
            merged[annotation.id].push(annotation);
        });
        return merged;
    }

    _renderTooltipAreas(container, xAxis, yAxis, mergedData) {
        let hoverWidth = this.width;
        if (Object.keys(mergedData).length > 1) {
            hoverWidth = this.width / (Object.keys(mergedData).length-1);
        }

        Object.keys(mergedData).forEach((valueId, valueIndex) => {
            container.append("rect")
                .attr("class", style["tooltip-hover-area"])
                .attr("width", hoverWidth)
                .attr("fill-opacity", 0)
                .attr("x", () => {
                    return xAxis(valueId) - hoverWidth/2
                })
                .attr("height", this.height)
                .on("mouseover", () => this.observable.fire('tooltipEnter', mergedData[valueId], valueId, valueIndex))
                .on("mouseleave", () => this.observable.fire('tooltipLeave', mergedData[valueId], valueId, valueIndex))
        });
    }

    _mergeSeriesData(series) {
        const data = {};
        series.forEach(line => {
            line.data.forEach(lineValue => {
                data[lineValue.id] = data[lineValue.id] || [];
                data[lineValue.id].push({
                    id: lineValue.id,
                    label: lineValue.label,
                    value: lineValue.value,
                    tooltip: lineValue.tooltip,
                    appearance: line.appearance
                });
            });
        });
        return data;
    }

    _renderTooltipLines(container, xAxis, yAxis, series) {
        Array.from(series).reverse().forEach((lineData, lineIndex) => {
            if (lineData.title) {
                this._renderTooltipLine(container, xAxis, yAxis, lineData, series.length-1 - lineIndex);
            }
        });
    }

    _renderTooltipLine(container, xAxis, yAxis, lineData, lineIndex) {

        const maskAppearance = Object.assign({}, lineData.appearance, {
            lineOpacity: 0,
            lineWidth: (lineData.appearance.lineWidth || LINE_WIDTH)*2,
            dotSize: (lineData.appearance.dotSize || DOT_SIZE)*2
        });

        const line = new LinechartLine();
        line.render(container.node());
        line.setData({
            height: this.height,
            xAxis,
            yAxis,
            lineData: lineData.data,
            appearance: maskAppearance,
            renderAreas: false
        });
        line.on("enter", () => this.observable.fire('lineEnter', lineData, lineIndex))
            .on("leave", () => this.observable.fire('lineLeave', lineData, lineIndex));
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

    _getGroupedData(data){
        let group = [];
        const result = [group];

        data.forEach(item=>{
            if (item.value === null){
                group = [];
                result.push(group);
            } else {
                group.push(item);
            }
        });

        return result;
    }

}

export default LinechartMask;
