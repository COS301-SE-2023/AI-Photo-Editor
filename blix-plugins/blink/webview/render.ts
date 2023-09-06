import * as PIXI from "pixi.js";
import { getPixiFilter, type Atom, type Clump, BlinkCanvas, Asset } from "./clump";

export function renderApp(
  blink: PIXI.Application,
  hierarchy: PIXI.Container,
  canvas: BlinkCanvas
): boolean {
  if (!canvas || !canvas.content) return false;
  // Destroy previous viewport contents
  hierarchy.removeChildren();

  // Preload all image assets
  const imgPromises = [];
  for (let assetId in canvas.assets) {
    if (canvas.assets[assetId].type === "image") {
      imgPromises.push(PIXI.Assets.load(canvas.assets[assetId].data));
      // TODO: Use bundles instead (e.g. PIXI.Assets.addBundle())
      // See: [https://pixijs.io/guides/basics/assets.html]
    }
  }

  // Construct clump hierarchy
  const loaded = Promise.all(imgPromises);
  loaded.then(() => {
    const child = renderClump(blink, canvas.content, canvas);
    if (child != null) {
      hierarchy.addChild(child);
    }
  });

  return true;
}

export function renderCanvas(blink: PIXI.Application, root: Clump) {}

function renderClump(blink: PIXI.Application, clump: Clump, canvas: BlinkCanvas) {
  if (!clump) return null;
  //========== CREATE CONTAINER ==========//
  const content = new PIXI.Container();
  content.sortableChildren = true;

  //========== CREATE CHILD ELEMENTS ==========//
  if (clump.elements) {
    let counter = clump.elements.length;
    for (let child of clump.elements) {
      if (child.class === "clump") {
        const pixiClump = renderClump(blink, child, canvas);

        if (pixiClump != null) {
          pixiClump.zIndex = counter--;
          content.addChild(pixiClump);
        }
      } else if (child.class === "atom") {
        const pixiAtom = renderAtom(canvas.assets, child);

        if (pixiAtom != null) {
          pixiAtom.zIndex = counter--;
          content.addChild(pixiAtom);
        }
      }
    }
  }

  //========== CREATE INTERACTION BOX ==========//
  // Create interaction box once sprite has loaded
  content.sortChildren();

  const resClump = new PIXI.Container();
  const resClumpContent = new PIXI.Container();
  resClump.sortableChildren = true;

  if (clump.filters && clump.filters.length > 0) {
    //===== FLATTEN CLUMP =====//
    // Clump uses filters, we must flatten it to a texture
    // so that the filters are applied evenly regardless of scaling

    // `renderPadding` is necessary for filters like
    // blur that spread beyond the bounds of the sprite
    const renderPadding = 100;

    // Apply filters
    content.filters = clump.filters.map(getPixiFilter);

    // Normalize offset to fit within renderTexture
    const { x: bx, y: by, width: bw, height: bh } = content.getBounds();
    content.transform.position.x = -bx + renderPadding;
    content.transform.position.y = -by + renderPadding;

    // Render to texture
    const renderTexture = PIXI.RenderTexture.create({
      width: bw + 2 * renderPadding,
      height: bh + 2 * renderPadding,
    });
    blink.renderer.render(content, { renderTexture: renderTexture });

    // Create flattened sprite and add to clump
    const renderSprite = new PIXI.Sprite(renderTexture);
    renderSprite.setTransform(bx - renderPadding, by - renderPadding);

    resClumpContent.addChild(renderSprite);
  } else {
    //===== ADD CONTENT WITHOUT FLATTENING =====//
    resClumpContent.addChild(content);
  }

  // Get bounds before applying transform
  const clumpBounds = resClumpContent.getBounds();

  //========== APPLY CLUMP PROPERTIES ==========//
  let transMatrix = PIXI.Matrix.IDENTITY;
  if (clump.transform) {
    const { position: pos, rotation: rot, scale: scl } = clump.transform;

    if (scl) transMatrix.scale(scl.x, scl.y);
    if (rot) transMatrix.rotate((rot * Math.PI) / 180);
    if (pos) transMatrix.translate(pos.x, pos.y);

    // if (pos) resClumpContent.setTransform(pos.x, pos.y);
    // if (rot) resClumpContent.angle = rot;
    // if (scl) resClumpContent.scale.set(scl.x, scl.y);
  }

  resClumpContent.transform.setFromMatrix(transMatrix);
  // const matTransform = resClumpContent.transform.worldTransform;

  if (clump.opacity) {
    resClumpContent.alpha = Math.min(100, Math.max(0, clump.opacity));
  }

  resClump.addChild(resClumpContent);

  const box = new PIXI.Graphics();
  // box.drawRect(clumpBounds.x, clumpBounds.y, clumpBounds.width, clumpBounds.height);

  box.beginFill(0xf43e5c, 1);

  const tl = transMatrix.apply(new PIXI.Point(clumpBounds.x, clumpBounds.y));
  const tr = transMatrix.apply(new PIXI.Point(clumpBounds.x + clumpBounds.width, clumpBounds.y));
  const bl = transMatrix.apply(new PIXI.Point(clumpBounds.x, clumpBounds.y + clumpBounds.height));
  const br = transMatrix.apply(
    new PIXI.Point(clumpBounds.x + clumpBounds.width, clumpBounds.y + clumpBounds.height)
  );

  const corners = [tl, tr, br, bl];
  for (let c = 0; c < 4; c++) {
    box.drawCircle(corners[c].x, corners[c].y, 10);

    box.lineStyle(5, 0xf43e5c, 0.5);
    box.moveTo(corners[c].x, corners[c].y);
    box.lineTo(corners[(c + 1) % 4].x, corners[(c + 1) % 4].y);
    box.lineStyle();
  }
  box.zIndex = 1000;

  resClump.addChild(box);
  resClump.sortChildren();

  resClump.eventMode = "dynamic";
  resClump.on("click", () => {
    console.log(clump.name + " click");
  });

  return resClump;
}

function renderAtom(assets: { [key: string]: Asset }, atom: Atom) {
  switch (atom.type) {
    case "image":
      if (assets[atom.assetId] && assets[atom.assetId].type === "image") {
        const sprite = PIXI.Sprite.from(assets[atom.assetId].data);

        sprite.anchor.x = 0.5;
        sprite.anchor.y = 0.5;

        return sprite;
      }

      return null;

    case "shape":
      const shapeContainer = new PIXI.Container();
      const shape = new PIXI.Graphics();
      // shape.lineStyle(1, 0xf43e5c, 0.5);
      shape.beginFill(atom.fill, 1);
      shape.lineStyle(atom.strokeWidth, atom.stroke, 1);

      switch (atom.shape) {
        case "rectangle":
          shape.drawRect(0, 0, atom.bounds.w, atom.bounds.h);
          break;
        case "ellipse":
          shape.drawEllipse(0, 0, atom.bounds.w, atom.bounds.h);
          break;
        case "triangle":
          shape.drawPolygon([0, 0, atom.bounds.w, 0, atom.bounds.w / 2, atom.bounds.h]);
          break;
      }
      shape.endFill();

      shapeContainer.addChild(shape);

      return shapeContainer;

    case "text":
      break;

    case "paint":
      break;
  }
}
