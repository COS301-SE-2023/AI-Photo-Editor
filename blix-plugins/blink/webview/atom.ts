import * as PIXI from 'pixi.js';
import type { Asset, Atom, CurveAsset, CurvePoint, ImageAtom, PaintAtom, ShapeAtom, TextAtom } from "./types";
import { diffAtom, diffCurveAtom, diffImageAtom, diffPaintAtom, diffShapeAtom, diffTextAtom } from './diff';
import { type HierarchyAtom, randomId } from './render';

export function renderAtom(assets: { [key: string]: Asset }, prevAssets: { [key: string]: Asset } | undefined, atom: Atom, prevAtom: HierarchyAtom | undefined, textures: { [key: string]: PIXI.Texture }): {
  pixiAtom: PIXI.Container,
  changed: boolean // Whether the pixiClump is a different PIXI object than before
} {
  console.log(">>>---------------------------------");
  if (!atom) return null;

  const atomsDiffer = diffAtom(atom, prevAtom);

  switch (atom.type) {
    case "image":
      const imageDiff = atomsDiffer || prevAssets == null || diffImageAtom(atom, prevAtom as ImageAtom, assets, prevAssets);
      if (!imageDiff) {
        return { pixiAtom: prevAtom.container, changed: false };
      }

      if (assets[atom.assetId] && assets[atom.assetId].type === "image") {
        const textureId = assets[atom.assetId].data as string;
        const sprite = PIXI.Sprite.from(textures[textureId]);

        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;

        sprite.name = `ImageSprite(${randomId()})`;
        // console.log("DESTROY PREV ATOM");
        prevAtom?.container?.destroy();
        return { pixiAtom: sprite, changed: true };
      }

      return { pixiAtom: null, changed: true };

    case "shape":
      const shapeDiff = atomsDiffer || diffShapeAtom(atom, prevAtom as ShapeAtom);
      if (!shapeDiff) {
        return { pixiAtom: prevAtom.container, changed: false };
      }

      const shapeContainer = new PIXI.Container();
      const shape = new PIXI.Graphics();
      // shape.lineStyle(1, 0xf43e5c, 0.5);
      shape.beginFill(atom.fill, atom.fillAlpha);
      shape.lineStyle(atom.strokeWidth, atom.stroke, atom.strokeAlpha);
      const halfBounds = { w: atom.bounds.w / 2, h: atom.bounds.h / 2 };

      switch (atom.shape) {
        case "rectangle":
          shape.drawRect(-halfBounds.w, -halfBounds.h, atom.bounds.w, atom.bounds.h);
          break;
        case "ellipse":
          shape.drawEllipse(0, 0, halfBounds.w, halfBounds.h);
          break;
        case "triangle":
          shape.drawPolygon([-halfBounds.w, halfBounds.h, halfBounds.w, halfBounds.h, 0, -halfBounds.h]);
          break;
      }
      shape.endFill();

      shapeContainer.addChild(shape);
      shapeContainer.name = `ShapeContainer(${randomId()})`;

      return { pixiAtom: shapeContainer, changed: true };

    case "text":
      const textDiff = atomsDiffer || diffTextAtom(atom, prevAtom as TextAtom);
      if (!textDiff) {
        return { pixiAtom: prevAtom.container, changed: false };
      }

      const textContainer = new PIXI.Container();
      const text = new PIXI.Text(atom.text, {
        fill: atom.fill,
        stroke: atom.stroke,
        strokeThickness: atom.strokeWidth,

        fontFamily: atom.fontFamily,
        fontSize: atom.fontSize,
        fontStyle: atom.fontStyle,
        fontWeight: atom.fontWeight,

        align: atom.textAlign,
        textBaseline: atom.textBaseline,
      });

      textContainer.addChild(text);
      textContainer.name = `TextContainer(${randomId()})`;

      textContainer.alpha = atom.alpha;

      return { pixiAtom: textContainer, changed: true };

    case "paint":
      const paintDiff = atomsDiffer || diffPaintAtom(atom, prevAtom as PaintAtom);
      if (!paintDiff) {
        return { pixiAtom: prevAtom.container, changed: false };
      }

      return { pixiAtom: null, changed: true };

    case "curve":
      const curveDiff = atomsDiffer || diffCurveAtom(atom, prevAtom as PaintAtom, assets, prevAssets);
      if (!curveDiff) {
        return { pixiAtom: prevAtom.container, changed: false };
      }

      const curveContainer = new PIXI.Container();
      const curve = new PIXI.Graphics();

      curve.beginFill(atom.fill, atom.fillAlpha);
      curve.lineStyle(atom.strokeWidth, atom.stroke, atom.strokeAlpha);

      if (assets[atom.assetId] && assets[atom.assetId].type === "curve") {
        // const path = (assets[atom.assetId] as CurveAsset).data CurvePoint[];

        const path = [
          {
            control1: { x: 50, y: 10 },
            control2: { x: 10, y: 300 },
            point: { x: 0, y: 0 },
          },
          {
            control1: { x: 50, y: 10 },
            control2: { x: 10, y: 300 },
            point: { x: 400, y: 400 },
          },
          {
            control1: { x: 400, y: 500 },
            control2: { x: 10, y: 500 },
            point: { x: 50, y: 10 },
          },
        ];

        if (path.length > 0) {
          curve.moveTo(path[0].point.x, path[0].point.y);

          for (let i = 1; i < path.length; i++) {
            curve.bezierCurveTo(
              path[i].control1.x,
              path[i].control1.y,
              path[i].control2.x,
              path[i].control2.y,
              path[i].point.x,
              path[i].point.y
            );
          }
        }
      }

      curve.endFill();

      curveContainer.addChild(curve);
      curveContainer.name = `CurveContainer(${randomId()})`;

      return { pixiAtom: curveContainer, changed: true };
  }
}