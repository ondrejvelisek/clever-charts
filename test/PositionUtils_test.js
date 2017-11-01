import * as PositionUtils from '../src/histogram/utils/PositionUtils';
import { equal } from 'assert';

class Handle {
  constructor(box){
    this._box = box;
  }
  getLabelBox(){
    return this._box;
  }
}

describe('PositionUtils', () => {
  it("Position offsets should be 0 if handles are in conflict", () => {
    const handle1 = new Handle({
      x:50,
      width:20
    });

    const handle2 = new Handle({
      x:200,
      width:20
    });

    const offsets = PositionUtils.getHandlePositionOffsets(handle1, handle2, 20, 360);

    equal(offsets[0], 0);
    equal(offsets[1], 0);
  });

  it("There should be position offsets when handles are in conflict", () => {
    const handle1 = new Handle({
      x:190,
      width:30
    });

    const handle2 = new Handle({
      x:200,
      width:30
    });

    const offsets = PositionUtils.getHandlePositionOffsets(handle1, handle2, 20, 360);

    equal(offsets[0], -20);
    equal(offsets[1], 20);
  });  

  it("First handle position offset should be 0 when the handle is at the left edge", () => {
    const handle1 = new Handle({
      x:0,
      width:50
    });

    const handle2 = new Handle({
      x:20,
      width:50
    });

    const offsets = PositionUtils.getHandlePositionOffsets(handle1, handle2, 20, 360);

    equal(offsets[0], 0);
    equal(offsets[1], 50);
  });    

  it("The second handle offset should be width of the handle when both handles are at the right edge", () => {
    const handle1 = new Handle({
      x:350,
      width:50
    });

    const handle2 = new Handle({
      x:360,
      width:10
    });

    const offsets = PositionUtils.getHandlePositionOffsets(handle1, handle2, 20, 360);

    equal(offsets[0], -60);
    equal(offsets[1], -10);
  });    
});