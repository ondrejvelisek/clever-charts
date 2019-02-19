import style from "./Linechart.css";
import Component from './Component';
import {
    DOT_SIZE,
    FILL_COLOR,
    FILL_OPACITY,
    LINE_COLOR,
    LINE_OPACITY,
    LINE_WIDTH,
    MARGIN
} from './LinechartDefaults';
import * as d3 from 'd3';

class LinechartLine extends Component {
    constructor() {
        super('linechart-line');
    }

    _setData(container, data, lastData) {
        if (Object.keys(data).length === 1 && data.appearance) {
            return this._updateAppearance(data.appearance);
        }
        if (Object.keys(data).length === 1 && (data.point || data.point === null)) {
            const pointData = Object.assign({}, lastData, data);
            return this._updatePoint(pointData);
        }

        this.container.selectAll("*").remove();
        const newData = Object.assign({}, lastData, data);
        this._parts = this._renderLine(newData);
        this._point = this._renderPoint();
        this._updateAppearance(newData.appearance);
        this._updatePoint(newData);
    }

    _renderPoint() {
        return this.container.append("circle")
            .attr("visibility", "hidden")
            .attr("class", style["tooltip-line-circle"]);
    }

    _updatePoint({point, appearance, lineData, xAxis, yAxis}) {
        if (!point) {
            this._point.attr("visibility", "hidden");
            return;
        }
        lineData.forEach(item => {
            if (point && item.value !== null && Number(point) === Number(item.id)) {
                this._point
                    .attr("visibility", "visible")
                    .attr("stroke-width", appearance.lineWidth || LINE_WIDTH)
                    .attr("stroke", appearance.lineColor || LINE_COLOR)
                    .attr("stroke-opacity", appearance.lineOpacity || LINE_OPACITY)
                    .attr("r", 2.5 + (appearance.lineWidth || LINE_WIDTH)/2)
                    .attr("transform", "translate("+xAxis(point)+", "+yAxis(item.value)+")")
            }
        });
    }

    _updateAppearance({lineColor, lineOpacity, fillColor, fillOpacity, lineWidth, dotSize}) {
        this._parts.forEach(part => {
            const strokeWidth = part.path.data()[0].length > 1 ? (lineWidth || LINE_WIDTH): (dotSize || DOT_SIZE);

            part.path
                .attr("stroke", lineColor || LINE_COLOR)
                .attr("stroke-opacity", isNaN(lineOpacity) ? LINE_OPACITY : lineOpacity)
                // note that in case of a single item, dot is rendered with a different size
                .attr("stroke-width", strokeWidth);

            if (part.area) {
                part.area
                    .attr("fill", fillColor || FILL_COLOR)
                    .attr("fill-opacity", isNaN(fillOpacity) ? FILL_OPACITY : fillOpacity);
            }
        });
    }

    _renderLine({height, xAxis, yAxis, lineData, renderAreas}) {
        let minHeight = height - MARGIN;
        let areaZero = Math.max(Math.min(minHeight, yAxis(0)), 0);

        // define the area
        let area = d3.area()
            .x(function(d) { return xAxis(d.id); })
            .y0(areaZero)
            .y1(function(d) { return yAxis(d.value); });

        // define the line
        let path = d3.line()
            .x(function(d) { return xAxis(d.id); })
            .y(function(d) { return yAxis(d.value); });

        // apply grouping if needed (null or other splits)
        const groupedData = this._getGroupedData(lineData);

        return groupedData.map(partData => {
            const part = {};

            // only add area if not rendering a dot
            if (renderAreas && partData.length>1){
                // add the area path
                part.area = this.container.append("path")
                    .data([partData])
                    .attr("class", style["area"])
                    .attr("d", area);
            }

            if (partData.length){

                // add the line path
                part.path = this.container.append("path")
                    .data([partData])
                    .attr("fill", "none")
                    .attr("stroke-linecap", "round")
                    .attr("class", style["line"])
                    .attr("d", d => {
                        const p = path(d);
                        // Fix issue in Chrome on Mac and Surface where
                        // path points are not rendered if it's a single point
                        if (p && p.split(",").length == 2){
                            return p + " " + p;
                        }
                        return p;
                    });
            }

            return part;
        });
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

    _shouldRenderZeroLine(yAxis, height){
        const zeroLinePosition = yAxis(0);
        const axisPosition = height - MARGIN;
        const treshold = 10;
        return zeroLinePosition < axisPosition - treshold;
    }
}

export default LinechartLine;
