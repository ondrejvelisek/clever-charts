import HistogramData from '../src/histogram/HistogramData';
import { equal } from 'assert';

const data = require('../examples/data/histogram/sample.json').content;
const options = {
  width: 360
};

const histogramData = new HistogramData(data, options);

describe('HistogramData', () => {
  it("HistogramData should return correct min and max", () => {
    const minMax = histogramData.getMinMax();

    equal(minMax.min, 1);
    equal(minMax.max, 421);
  });

  it("HistogramData should return correct value ratio", () => {
    const valueRatio = histogramData.getValueRatio();
    equal(valueRatio.toFixed(2), 1.17);
  });

  it("HistogramData should return value from given position", () => {
    const value = histogramData.positionToValue(300);
    equal(value, 351);
  });

  it("HistogramData should return position from given value", () => {
    const value = histogramData.valueToPosition(300);
    equal(value, 256);
  });
});