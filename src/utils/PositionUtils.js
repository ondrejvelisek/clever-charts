/**
 * @public
 * Returns handle positions offsets so that labels don't conflict visually
 * @param {HistogramData} histogramData 
 * @returns {Array} label offsets
 */
export function getHandlePositionOffsets(handle1, handle2, maskPadding, width){
    var label1Box = handle1.getLabelBox();
    var label2Box = handle2.getLabelBox();

    // calculate conflict number
    var conflictDiff = label2Box.x - (label1Box.x + label1Box.width)-maskPadding;
    // and handle if there is not enough space
    if (conflictDiff<0){
        // pos1 diff to the left
        var posDiff1 = conflictDiff/2;
        // pos2 diff to to right
        var posDiff2 = conflictDiff/2;

        // position left to 0 if position would be lower than 0
        var xMin = label1Box.x+posDiff1;
        if (xMin < 0){
            posDiff1 = label1Box.x; 
            // also shift right label so we keep it visible
            posDiff2 = posDiff2*2
        }

        // same with max value
        var xMax = label2Box.x+label2Box.width-posDiff2;
        if (xMax > width){
            // needs to consider 0.5px offset otherwise label woudl shift, TODO: investigate why
            var offset = 0.5;
            posDiff2 += xMax-width-offset; 
            posDiff1 = posDiff1*2
        }
        return [posDiff1, -posDiff2];                  
    }

    return [0,0];
}