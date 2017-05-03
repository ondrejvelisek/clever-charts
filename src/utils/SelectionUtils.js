import * as Defaults from "../HistogramDefaults";

/**
 * @public
 * @param {HistogramData} histogramData 
 */
export function getDefaultSelection(histogramData){
    var minMax = histogramData.getMinMax();
    var colors = Defaults.DEFAULT_COLORS;
    var start = minMax.min;
    var step = (minMax.max - minMax.min) / colors.length;
    return colors.map(color=>{
        var from = start;
        var to = start + step;
        start += step;

        return {
            from:from, 
            to:to,
            color:color
        }
    });
}