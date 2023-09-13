import * as PIXI from "pixi.js";
import { Matrix } from "pixi.js";
import {
  KawaseBlurFilter,
  BloomFilter,
  GrayscaleFilter,
  BevelFilter,
  OutlineFilter,
  DotFilter,
  CRTFilter,
  EmbossFilter,
  BulgePinchFilter,
  GlitchFilter,
  ZoomBlurFilter,
  TwistFilter
} from "pixi-filters"
import { type } from "os";

export type BlinkCanvas = {
  assets: { [key: string]: Asset };
  content: Clump | null;
}

export type Asset = {
  class: "asset";
  type: "image" | "text" | "blob";
  data: any;
};

export type Clump = {
  class: "clump";
  name?: string;
  nodeUUID: string;
  transform: Transform;
  opacity?: number;
  elements: (Clump | Atom)[];
  filters?: Filter[];
};

export type Transform = {
  position: { x: number, y: number };
  rotation: number;
  scale: { x: number, y: number };
}

export type Filter = {
    class: "filter";
    type: "blur" | "noise" | "bloom" | "grayscale" | "bevel" | "outline" | "dot" | "crt" | "emboss" | "bulge" | "glitch" | "zoomblur" | "twist";
    params: any[]
};

export function getPixiFilter(filter: Filter) {
    switch (filter.type) {
        case "blur":        return new PIXI.BlurFilter(...filter.params);
        case "noise":       return new PIXI.NoiseFilter(...filter.params);
        case "bloom":       return new BloomFilter(...filter.params);
        case "grayscale":   return new GrayscaleFilter();
        case "bevel":       return new BevelFilter(
          {
            rotation: filter.params[0], 
            thickness: filter.params[1],
            lightColor: filter.params[2],
            lightAlpha: filter.params[3],
            shadowColor: filter.params[4],
            shadowAlpha: filter.params[5],
          }
        );
        case "outline":     return new OutlineFilter(...filter.params);
        case "dot":         return new DotFilter(...filter.params);
        case "crt":         return new CRTFilter(
          {
            curvature: filter.params[0],
            lineWidth: filter.params[1],
            lineContrast: filter.params[2],
            noise: filter.params[3],
            noiseSize: filter.params[4],
            vignetting: filter.params[5],
            vignettingAlpha: filter.params[6],
            vignettingBlur: filter.params[7],
            seed: filter.params[8],
          }
        );
        case "emboss":      return new EmbossFilter(...filter.params);
        case "bulge":       return new BulgePinchFilter(...filter.params);
        case "glitch":      return new GlitchFilter(...filter.params);
        case "zoomblur":    return new ZoomBlurFilter(...filter.params);
        case "twist":       return new TwistFilter(...filter.params);
    }
}

// A single indivisible unit of a clump (E.g. image, shape, text etc.)
export type Atom = { class: "atom", nodeUUID: string } & (ImageAtom | ShapeAtom | TextAtom | PaintAtom | BlobAtom);
type ImageAtom = {
  type: "image";
  assetId: string;
};

type BlobAtom = {
  type: "blob";
  assetId: string;
}

type ShapeAtom = {
  type: "shape";
  shape: "rectangle" | "ellipse" | "triangle";

  bounds: { w: number, h: number };
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
    nodeUUID: "a",
    transform: { position: { x: 0, y: 0 }, rotation: 0, scale: { x: 1, y: 1 } },
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
        nodeUUID: "b",
      },
      {
        class: "clump",
        nodeUUID: "",
        name: "clump1",
        transform: { position: { x: 500, y: 500 }, rotation: 0, scale: { x: 1, y: 1 } },
        elements: [
          {
            class: "atom",
            type: "shape",
            shape: "rectangle",
            nodeUUID: "c",

            bounds: { w: 100, h: 100 },
            fill: 0xff0000,
            stroke: 0x00ff00,
            strokeWidth: 5,
          },
          {
            class: "atom",
            type: "text",
            text: "Hello World",
            nodeUUID: "d",

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
            nodeUUID: "e",
          },
        ],
      },
    ],
  }
};
