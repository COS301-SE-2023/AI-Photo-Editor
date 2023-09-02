import * as PIXI from "pixi.js";
import { Matrix } from "pixi.js";

export type BlinkCanvas = {
  assets: { [key: string]: Asset };
  content: Clump;
}

export type Asset = {
  class: "asset";
  type: "image" | "text";
  data: any;
};

export type Clump = {
  class: "clump";
  name?: string;
  transform: Matrix;
  elements: (Clump | Atom)[];
  filters?: Filter[];
};

export type Filter = {
    class: "filter";
    type: "blur" | "noise" | "color";
    params: any[]
};

export function getPixiFilter(filter: Filter) {
    switch (filter.type) {
        case "blur":        return new PIXI.BlurFilter(...filter.params);
        case "noise":       return new PIXI.NoiseFilter(...filter.params);
        case "color":       return new PIXI.ColorMatrixFilter();
    }
}

// A single indivisible unit of a clump (E.g. image, shape, text etc.)
export type Atom = { class: "atom" } & (ImageAtom | ShapeAtom | TextAtom | PaintAtom);
type ImageAtom = {
  type: "image";
  assetId: string;
};
type ShapeAtom = {
  type: "shape";
  shape: "rect" | "circle" | "ellipse" | "line" | "polygon" | "polyline";

  fill: number;
  stroke: number;
  strokeWidth: number;
};
type TextAtom = {
  type: "text";
  text: string;

  fill: number;
  stroke: number;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  fontStyle: "normal" | "italic";
  fontWeight: "normal" | "bold";
  textAlign: "left" | "center" | "right";
  textBaseline: "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom";
};
type PaintAtom = {
  type: "paint";
  uuid: string;
};

export const canvas1: BlinkCanvas = {
  assets: {
    "1": {
      class: "asset",
      type: "image",
      data: "media/bird.png",
    },
    "2": {
      class: "asset",
      type: "image",
      data: "media/blueArrow.png",
    }
  },
  content: {
    class: "clump",
    name: "root",
    transform: new Matrix(),
    filters: [
      { class: "filter", type: "blur", params: [100, 25] },
      // { class: "filter", type: "noise", params: [10] },
      // { class: "filter", type: "color", params: [] },
    ],
    elements: [
      {
        class: "atom",
        type: "image",
        assetId: "1",
      },
      {
        class: "clump",
        name: "clump1",
        transform: new Matrix().translate(500, 500),
        elements: [
          {
            class: "atom",
            type: "shape",
            shape: "rect",

            fill: 0xff0000,
            stroke: 0x00ff00,
            strokeWidth: 5,
          },
          {
            class: "atom",
            type: "text",
            text: "Hello World",

            fill: 0x0000ff,
            stroke: 0x00ff00,
            strokeWidth: 5,
            fontSize: 20,
            fontFamily: "Arial",
            fontStyle: "italic",
            fontWeight: "bold",
            textAlign: "center",
            textBaseline: "middle",
          },
          {
            class: "atom",
            type: "image",
            assetId: "2",
          },
        ],
      },
    ],
  }
};
