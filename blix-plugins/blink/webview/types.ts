import * as PIXI from "pixi.js";
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
  TwistFilter,
  AdjustmentFilter
} from "pixi-filters"

export type WindowWithApis = Window & typeof globalThis & {
  api: {
    send: (channel: string, data: any) => {};
    on: (channel: string, func: (..._: any) => any) => {};
  };

  cache: {
    write: (content: Blob, metadata?: any) => Promise<string | null>;
    get: (id: string) => Promise<any | null>;
    delete: (id: string) => Promise<boolean>;
  };
};


export type BlinkCanvas = {
  assets: { [key: string]: Asset };
  config?: BlinkCanvasConfig;
  content: Clump | null;
}

export type BlinkCanvasConfig = {
  canvasDims: { w: number, h: number };
  canvasColor: number;
  canvasAlpha: number;

  exportName: string;
};

export type Asset = { class: "asset" } & (ImageAsset | CurveAsset);

export type ImageAsset = {
  type: "image";
  data: string;
}

export type CurveAsset = {
  type: "curve"
  data: CurvePoint[];
}

export type CurvePoint = {
  control1: Vec2;
  control2: Vec2;
  point: Vec2;
}

export type Vec2 = { x: number, y: number };

export type Clump = {
  class: "clump";
  name?: string;
  nodeUUID: string;
  transform: Transform;
  opacity?: number;
  elements: (Clump | Atom)[];
  filters?: Filter[];
  mask?: Clump;
};

export type Transform = {
  position: Vec2;
  rotation: number;
  scale: Vec2;
  origin: OriginPoint;
}

export type OriginPoint = "tl" | "tm" | "tr" | "ml" | "mm" | "mr" | "bl" | "bm" | "br";

export type Filter = {
    class: "filter";
    type: "blur" | "noise" | "bloom" | "grayscale" | "bevel" | "outline" | "dot" | "crt" | "emboss" | "bulge" | "glitch" | "zoomblur" | "twist" | "brightnessContrast" | "saturationGamma" | "colorChannel";
    params: any[]
};

export function getPixiFilter(filter: Filter) {
  try {
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
        case "bulge":       return new BulgePinchFilter(
          {
            radius: filter.params[0],
            strength: filter.params[1],
            center: new PIXI.Point(filter.params[2], filter.params[3]),
          }
        );
        case "glitch":      return new GlitchFilter(...filter.params);
        case "zoomblur":    return new ZoomBlurFilter(
          {
            strength: filter.params[0],
            innerRadius: filter.params[1],
            center: [filter.params[2], filter.params[3]],
          }
        );
        case "twist":       return new TwistFilter(
          {
            angle: filter.params[0],
            radius: filter.params[1],
            offset: new PIXI.Point(filter.params[2], filter.params[3]),
          }
        );
        case "brightnessContrast": return new AdjustmentFilter(
          {
            brightness: filter.params[0],
            contrast: filter.params[1],
          }
        );
        case "saturationGamma": return new AdjustmentFilter(
          {
            saturation: filter.params[0],
            gamma: filter.params[1],
          }
        );
        case "colorChannel": return new AdjustmentFilter(
          {
            red: filter.params[0],
            green: filter.params[1],
            blue: filter.params[2],
            alpha: filter.params[3],
          }
        );
    }
  } catch {
    return new PIXI.Filter();
  }
}

// A single indivisible unit of a clump (E.g. image, shape, text etc.)
export type Atom = { class: "atom", nodeUUID: string } & (ImageAtom | ShapeAtom | TextAtom | PaintAtom | CurveAtom);
export type ImageAtom = {
  type: "image";
  assetId: string;
};

export type CurveAtom = {
  type: "curve";
  assetId: string;
  fill: number;
  fillAlpha: number;
  stroke: number;
  strokeAlpha: number;
  strokeWidth: number;
}

export type ShapeAtom = {
  type: "shape";
  shape: "rectangle" | "ellipse" | "triangle";

  bounds: { w: number, h: number };
  fill: number;
  fillAlpha: number;
  stroke: number;
  strokeAlpha: number;
  strokeWidth: number;
};
export type TextAtom = {
  type: "text";
  text: string;

  fill: number;
  stroke: number;
  alpha: number;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  fontStyle: "normal" | "italic";
  fontWeight: "normal" | "bold";
  textAlign: "left" | "center" | "right";
  textBaseline: "top" | "hanging" | "middle" | "alphabetic" | "ideographic" | "bottom";
};
export type PaintAtom = {
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
            fillAlpha: 1,
            stroke: 0x00ff00,
            strokeAlpha: 1,
            strokeWidth: 5,
          },
          {
            class: "atom",
            type: "text",
            text: "Hello World",
            nodeUUID: "d",

            fill: 0x0000ff,
            stroke: 0x00ff00,
            alpha: 1,
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
