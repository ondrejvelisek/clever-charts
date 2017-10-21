import HistogramSelectionRenderer from '../src/histogram/selection/HistogramSelectionRenderer';
import MultipleHistogramSelectionImpl from '../src/histogram/selection/MultipleHistogramSelectionImpl';
import HistogramData from '../src/histogram/HistogramData';
import { equal } from 'assert';

const options = {
  width: 360,
  inactiveBarColor:"grey",
  overSelectionColor:"yellow",
  selectionColor:"green"
};

let selectionRenderer = new HistogramSelectionRenderer();
let histogramSelection;
let histogramData;
let positions;
let selection;
const data = require('../examples/data/histogram/sample.json').content;

beforeEach((done) => {
  positions = [
    15,
    85,
    171,
    256,
    360
  ];

  selection = [
    {"from":0.5,"to":100, color:"rgba(0,0,0,0.1)"},
    {"from":100,"to":200, color:"rgba(0,0,0,0.2)"},
    {"from":200.5,"to":300, color:"rgba(0,0,0,0.3)", disabled:true},
    {"from":300,"to":421, color:"rgba(0,0,0,0.4)"}
  ];

  histogramData = new HistogramData(data, options);
  histogramSelection = new MultipleHistogramSelectionImpl(histogramData, JSON.parse(JSON.stringify(selection)));

  selectionRenderer = new HistogramSelectionRenderer();
  selectionRenderer._histogramSelection = histogramSelection;
  selectionRenderer._histogramData = histogramData;
  selectionRenderer._options = options;

  done();
});

describe('HistogramSelectionRenderer', () => {
  // there was a bug when selection was changed to pixel equivalent even it selection 
  // didn't change
  it("Shouldn't update selection when position doesn't change", () => {
    selectionRenderer._updateSelectionPositions(positions);
    const selection = histogramSelection.getSelection();
    equal(selection[0].from, selection[0].from);
  });

  // when position changes, we need to update selection to its px equivalent
  it("Should update selection when position changes", () => {
    selectionRenderer._updateSelectionPositions(positions);
    const selection = histogramSelection.getSelection();
    equal(selection[0].from, 18.5);
  });

  // there was a bug when selection was changed by prompt value but the pixel
  // position remained same
  it("Should update selection when prompt value is different but px value is same", () => {
    const points = histogramSelection.getSelectionPoints();
    // only change selection value slightly so the pixel position stays the same
    points[1].value = 100.123;
    selectionRenderer._updateSelectionPositions(positions, points);
    const selection = histogramSelection.getSelection();
    equal(selection[1].from, 100.123);
  });

  // if drag occures (position change), we shouldn't update selection points that didn't 
  // change when dragging
  it("Shouldn't update decimal selection point after drag ", () => {
    positions[0] = 50;
    selectionRenderer._updateSelectionPositions(positions);
    const selection = histogramSelection.getSelection();
    equal(selection[2].from, 200.5);
  });

  it("It should return correct selection color for selection by px", () => {
    const selection1Color = selectionRenderer._getBarColor(75, selection, histogramData);
    const selection2Color = selectionRenderer._getBarColor(125, selection, histogramData);
    equal(selection1Color, "rgba(0,0,0,0.1)");
    equal(selection2Color, "rgba(0,0,0,0.2)");
  });

  it("It should return correct selection for disabled selection", () => {
    const selectionColor = selectionRenderer._getBarColor(250, selection, histogramData);
    equal(selectionColor, "grey");
  });

  it("It should return correct selection for hover selection", () => {
    selectionRenderer._overSelectionIndex = 0;
    const selection1Color = selectionRenderer._getBarColor(20, selection, histogramData);
    equal(selection1Color, "yellow");
  });

  it("It should return correct selection for hover selection when disabled", () => {
    selectionRenderer._overSelectionIndex = 2;
    const selection1Color = selectionRenderer._getBarColor(250, selection, histogramData);
    equal(selection1Color, "grey");
  });
});