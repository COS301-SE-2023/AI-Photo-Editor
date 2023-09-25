import type { HierarchyAtom, HierarchyClump } from "./render";
import type {
  Asset,
  Atom,
  BlinkCanvasConfig,
  Clump,
  CurveAtom,
  Filter,
  ImageAtom,
  PaintAtom,
  ShapeAtom,
  TextAtom,
  Transform,
} from "./types";

export type ClumpDiff = "name" | "transform" | "opacity" | "filters" | "mask";

export function diffClump(h1: Clump, h2: HierarchyClump) {
  const diffs = new Set<ClumpDiff>();
  if (h1 == null && h2 == null) return new Set<ClumpDiff>([]); // Vacuous case
  if (h1 == null || h2 == null)
    return new Set<ClumpDiff>(["name", "transform", "opacity", "filters", "mask"]);

  // Diff name
  if (h1.name !== h2.name) {
    diffs.add("name");
  }

  // Diff transform
  if (h1.transform == null && h2.transform == null) {
    diffs.add("transform");
  } else if (diffTransform(h1.transform, h2.transform).length > 0) {
    diffs.add("transform");
  }

  // Diff opacity
  if (h1.opacity !== h2.opacity) {
    diffs.add("opacity");
  }

  // Diff filters
  if (diffFilters(h1.filters, h2.filters)) {
    diffs.add("filters");
  }

  // Diff mask
  if (diffClump(h1.mask, h2.mask as HierarchyClump).size > 0) {
    diffs.add("mask");
  }

  return diffs;
}

function diffTransform(t1: Transform, t2: Transform) {
  const diffs = [];
  if (t1?.position?.x !== t2?.position?.x || t1?.position?.y !== t2?.position?.y)
    diffs.push("position");
  if (t1?.rotation !== t2?.rotation) diffs?.push("rotation");
  if (t1?.scale?.x !== t2?.scale?.x || t1?.scale?.y !== t2?.scale?.y) diffs?.push("scale");
  return diffs;
}

// Returns true if the filters differ in some way
function diffFilters(f1s: Filter[], f2s: Filter[]) {
  if (f1s == null && f2s == null) return false;
  if (f1s == null || f2s == null) return true;

  const maxLen = Math.max(f1s.length, f2s.length);

  for (let f = 0; f < maxLen; f++) {
    // Diff filter
    if (f1s[f] && f2s[f]) {
      // Diff types
      if (f1s[f].type !== f2s[f].type) return true;

      // Diff params
      const maxParamsLen = Math.max(f1s[f].params.length, f2s[f].params.length);
      for (let p = 0; p < maxParamsLen; p++) {
        if (f1s[f].params[p] !== f2s[f].params[p]) {
          return true;
        }
      }
    } else {
      return true;
    }
  }

  return false;
}

// Returns true if the atoms differ in some way
export function diffAtom(a1: Atom, a2: HierarchyAtom) {
  if (a1 == null && a2 == null) return false;
  if (a1 == null || a2 == null) return true;

  if (a1.type !== a2.type) return true;
  return false;
}

// TODO: Pass in `assets` later on, so that we can diff on asset.data instead of assetId
// TODO: For now this just returns a boolean, but later on we'll return a more fine-grained diff
export function diffImageAtom(a1: ImageAtom, a2: ImageAtom, assets1: { [key: string]: Asset }, assets2: { [key: string]: Asset } ) {
  if (a1.assetId !== a2.assetId) return true;
  if (assets1[a1.assetId].type !== assets2[a2.assetId].type) return true;
  if (assets1[a1.assetId].data !== assets2[a2.assetId].data) return true;
  return false;
}

export function diffCurveAtom(a1: CurveAtom, a2: CurveAtom, assets1: { [key: string]: Asset }, assets2: { [key: string]: Asset }) {
  if (a1.assetId !== a2.assetId) return true;
  if (assets1[a1.assetId].type !== assets2[a2.assetId].type) return true;
  if (assets1[a1.assetId].data !== assets2[a2.assetId].data) return true;

  if (a1.fill !== a2.fill) return true;
  if (a1.fillAlpha !== a2.fillAlpha) return true;
  if (a1.stroke !== a2.stroke) return true;
  if (a1.strokeAlpha !== a2.strokeAlpha) return true;
  if (a1.strokeWidth !== a2.strokeWidth) return true;
  return false;
}

export function diffShapeAtom(a1: ShapeAtom, a2: ShapeAtom) {
  if (a1.shape !== a2.shape) return true;
  if (a1.bounds?.w !== a2.bounds?.w || a1.bounds?.h !== a2.bounds?.h) return true;
  if (a1.fill !== a2.fill) return true;
  if (a1.fillAlpha !== a2.fillAlpha) return true;
  if (a1.stroke !== a2.stroke) return true;
  if (a1.strokeAlpha !== a2.strokeAlpha) return true;
  if (a1.strokeWidth !== a2.strokeWidth) return true;
  return false;
}

export function diffTextAtom(a1: TextAtom, a2: TextAtom) {
  if (a1.text !== a2.text) return true;
  if (a1.fill !== a2.fill) return true;
  if (a1.stroke !== a2.stroke) return true;
  if (a1.strokeWidth !== a2.strokeWidth) return true;
  if (a1.fontSize !== a2.fontSize) return true;
  if (a1.fontFamily !== a2.fontFamily) return true;
  if (a1.fontStyle !== a2.fontStyle) return true;
  if (a1.fontWeight !== a2.fontWeight) return true;
  if (a1.textAlign !== a2.textAlign) return true;
  if (a1.textBaseline !== a2.textBaseline) return true;
  return false;
}

export function diffPaintAtom(a1: PaintAtom, a2: PaintAtom) {
  if (a1.uuid !== a2.uuid) return true;
  return false;
}

export type CanvasConfigDiff = "canvasBlock" | "exportName";

export function diffCanvasConfig(c1: BlinkCanvasConfig, c2: BlinkCanvasConfig) {
  const diffs = new Set<CanvasConfigDiff>();
  if (c1 == null && c2 == null) return new Set<CanvasConfigDiff>([]); // Vacuous case
  if (c1 == null || c2 == null)
    return new Set<CanvasConfigDiff>(["canvasBlock", "exportName"]);

  if (
    c1.canvasDims.w !== c2.canvasDims.w ||
    c1.canvasDims.h !== c2.canvasDims.h ||
    c1.canvasColor !== c2.canvasColor ||
    c1.canvasAlpha !== c2.canvasAlpha
  ) {
    diffs.add("canvasBlock");
  }

  if (c1.exportName !== c2.exportName) {
    diffs.add("exportName");
  }

  return diffs;
}