import { type Viewport } from "pixi-viewport";
import * as PIXI from "pixi.js";

const BOX_CORNER_DOT_SIZE = 5;
const BOX_EDGE_DOT_SIZE = 4;
const BOX_LINE_WIDTH = 2;

export function createBoundingBox(transMatrix: PIXI.Matrix, bounds: PIXI.Rectangle, viewport: Viewport) {

  //===== COMPUTE CORNERS =====//
  const tl = transMatrix.apply(new PIXI.Point(bounds.x, bounds.y));
  const tr = transMatrix.apply(new PIXI.Point(bounds.x + bounds.width, bounds.y));
  const bl = transMatrix.apply(new PIXI.Point(bounds.x, bounds.y + bounds.height));
  const br = transMatrix.apply(new PIXI.Point(bounds.x + bounds.width, bounds.y + bounds.height));

  const corners = [tl, tr, br, bl];

  for (let c = 0; c < 4; c++) {
    corners[c] = viewport.toScreen(corners[c]);
  }

  //===== CONSTRUCT BOX LINES =====//
  const boxLines = new PIXI.Graphics();
  boxLines.beginFill(0xf43e5c, 1);

  for (let c = 0; c < 4; c++) {
    const c2 = (c + 1) % 4;

    boxLines.lineStyle(BOX_LINE_WIDTH, 0xf43e5c, 0.5);
    boxLines.moveTo(corners[c].x, corners[c].y);
    boxLines.lineTo(corners[c2].x, corners[c2].y);
    boxLines.lineStyle();
  }

  //===== CONSTRUCT BOX DOTS =====//
  const boxDots: PIXI.Graphics[] = [];
  const cursorsCorner = ["nwse-resize", "nesw-resize", "nwse-resize", "nesw-resize"];
  const cursorsEdge = ["ew-resize", "ns-resize", "ew-resize", "ns-resize"];

  for (let c = 0; c < 4; c++) {
    const c2 = (c + 1) % 4;

    const boxDot1 = new PIXI.Graphics();

    boxDot1.interactive = true;
    boxDot1.beginFill(0xf43e5c, 1);
    boxDot1.cursor = cursorsCorner[c];
    boxDot1.drawCircle(corners[c].x, corners[c].y, BOX_CORNER_DOT_SIZE);
    boxDots.push(boxDot1);

    const boxDot2 = new PIXI.Graphics();
    boxDot2.interactive = true;
    boxDot2.beginFill(0xf43e5c, 1);
    boxDot2.cursor = cursorsEdge[c2];
    boxDot2.drawCircle((corners[c].x + corners[c2].x) / 2, (corners[c].y + corners[c2].y) / 2, BOX_EDGE_DOT_SIZE);
    boxDots.push(boxDot2);
  }

  //===== BUILD BOX =====//
  const box = new PIXI.Container();
  box.addChild(boxLines);
  for (const boxDot of boxDots) {
    box.addChild(boxDot);
  }

  box.zIndex = 1000;

  return box;
}
