import * as PIXI from 'pixi.js';
import { Asset, Atom, ImageAtom, PaintAtom, ShapeAtom, TextAtom } from "./types";
import { diffAtom, diffImageAtom, diffPaintAtom, diffShapeAtom, diffTextAtom } from './diff';
import { HierarchyAtom } from './render';

export function renderAtom(assets: { [key: string]: Asset }, prevAssets: { [key: string]: Asset } | undefined, atom: Atom, prevAtom: HierarchyAtom | undefined): {
  pixiAtom: PIXI.Container,
  changed: boolean // Whether the pixiClump is a different PIXI object than before
} {
  if (!atom) return null;

  const atomsDiffer = diffAtom(atom, prevAtom);

  switch (atom.type) {
    case "image":
      const imageDiff = atomsDiffer || prevAssets == null || diffImageAtom(atom, prevAtom as ImageAtom, assets, prevAssets);
      if (!imageDiff) {
        return { pixiAtom: prevAtom.container, changed: false };
      }

      if (assets[atom.assetId] && assets[atom.assetId].type === "image") {
        const sprite = PIXI.Sprite.from(assets[atom.assetId].data);

        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;

        sprite.name = "ImageSprite";
        prevAtom?.container?.destroy();
        return { pixiAtom: sprite, changed: true };
      }

      return { pixiAtom: null, changed: true };

    case "shape":
      const shapeDiff = atomsDiffer || diffShapeAtom(atom, prevAtom as ShapeAtom);
      if (!shapeDiff) return { pixiAtom: prevAtom.container, changed: false };

      const shapeContainer = new PIXI.Container();
      const shape = new PIXI.Graphics();
      // shape.lineStyle(1, 0xf43e5c, 0.5);
      shape.beginFill(atom.fill, 1);
      shape.lineStyle(atom.strokeWidth, atom.stroke, 1);
      const halfBounds = { w: atom.bounds.w / 2, h: atom.bounds.h / 2 };

      switch (atom.shape) {
        case "rectangle":
          shape.drawRect(-halfBounds.w, -halfBounds.h, atom.bounds.w, atom.bounds.h);
          break;
        case "ellipse":
          shape.drawEllipse(-halfBounds.w, -halfBounds.h, atom.bounds.w, atom.bounds.h);
          break;
        case "triangle":
          shape.drawPolygon([0, 0, atom.bounds.w, 0, atom.bounds.w / 2, atom.bounds.h]);
          break;
      }
      shape.endFill();

      shapeContainer.addChild(shape);

      shapeContainer.name = "ShapeContainer";
      return { pixiAtom: shapeContainer, changed: true };

    case "text":
      const textDiff = atomsDiffer || diffTextAtom(atom, prevAtom as TextAtom);
      if (!textDiff) return { pixiAtom: prevAtom.container, changed: false };

      return { pixiAtom: null, changed: true };

    case "paint":
      const paintDiff = atomsDiffer || diffPaintAtom(atom, prevAtom as PaintAtom);
      if (!paintDiff) return { pixiAtom: prevAtom.container, changed: false };

      return { pixiAtom: null, changed: true };
  }
}