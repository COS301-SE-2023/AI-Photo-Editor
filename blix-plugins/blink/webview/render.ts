import * as PIXI from "pixi.js";
import { getPixiFilter, type Atom, type Clump, type BlinkCanvas, type Asset } from "./clump";
import { Viewport } from "pixi-viewport";
import { createBoundingBox } from "./select";

// let prevMedia = null; // TODO: Replace with DiffDial

type Scene = { [key: string]: PIXI.Container };

let selected: string = ""; // NodeUUID of selected clump

let oldSceneStructure = "";
let sceneStructure = "_";
let oldScene: Scene = {};
let clumps: Scene = {};

let boundingBox: PIXI.Container;
let scene: PIXI.Container;

export function renderApp(
  blink: PIXI.Application,
  canvas: BlinkCanvas,
  viewport: Viewport,
  send: (message: string, data: any) => void
): boolean {
  if (!canvas || !canvas.content) return false;
  if (!scene) scene = viewport.addChild(new PIXI.Container());

  oldSceneStructure = sceneStructure;
  sceneStructure = getSceneStructure(canvas.content);

  if (oldSceneStructure === sceneStructure) return;

  // Destroy previous viewport contents
  scene.removeChildren();
  oldScene = clumps;
  clumps = {};

  //===== CREATE BOUNDING BOX =====//
  boundingBox = new PIXI.Container();
  blink.stage.addChild(boundingBox);

  //===== PRELOAD IMAGE ASSETS =====//
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

    const child = renderClump(blink, canvas.content, canvas, viewport, send);
    if (child != null) {
      scene.addChild(child);
    }

    //===============// DELETE DEAD CLUMPS //==============//
    // const newClumps = new Set(Object.keys(scene));

    // for (let nodeUUID in oldScene) {
    //   if (!newClumps.has(nodeUUID)) {
    //     oldScene[nodeUUID].destroy(); // PIXI.js cleanup
    //   }
    // }
    console.log("CLUMPS", clumps);
    console.log("SCENE", scene);
  });

  return true;
}

function getSceneStructure(clump: Clump) {
  if (!clump) return "";
  let res = clump.nodeUUID;

  if (clump.elements) {
    let counter = clump.elements.length;
    for (let child of clump.elements) {
      if (child.class === "clump") {
        res += ">" + getSceneStructure(child);
      } else if (child.class === "atom") {
        // res += ">" + child.nodeUUID;
      }
    }
  }

  return res;
}

export function renderCanvas(blink: PIXI.Application, root: Clump) {}

function renderClump(
  blink: PIXI.Application,
  clump: Clump,
  canvas: BlinkCanvas,
  viewport: Viewport,
  send: (message: string, data: any) => void
) {
  if (!clump) return null;

  // //===============// RESURRECT OLD CLUMPS //==============//
  // if (clump.nodeUUID in oldScene) {
  //   // Clump already exists, resurrect and update it
  //   scene[clump.nodeUUID] = oldScene[clump.nodeUUID];
  // }
  // //===============// ADD NEW CLUMPS //==============//
  // else {
  // }

  //========== CREATE CONTAINER ==========//
  const content = new PIXI.Container();
  content.sortableChildren = true;

  //========== CREATE CHILD ELEMENTS ==========//
  if (clump.elements) {
    let counter = clump.elements.length;
    for (let child of clump.elements) {
      if (child.class === "clump") {
        const pixiClump = renderClump(blink, child, canvas, viewport, send);

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
  }

  resClump.transform.setFromMatrix(transMatrix);
  // const matTransform = resClumpContent.transform.worldTransform;

  if (clump.opacity) {
    resClumpContent.alpha = Math.min(100, Math.max(0, clump.opacity));
  }

  resClump.addChild(resClumpContent);

  const box = createBoundingBox(transMatrix, clumpBounds, viewport);

  boundingBox.removeChildren();
  boundingBox.addChild(box);

  resClump.sortChildren();

  //========== HANDLE EVENTS ==========//
  let dragging = false;
  var prevMousePos = new PIXI.Point();

  resClump.eventMode = "dynamic";
  // resClump.on("click", () => {
  // });

  resClump.on("mousedown", (event) => {
    event.stopPropagation();
    selected = clump.nodeUUID;
    dragging = true;
    prevMousePos = viewport.toWorld(event.global);
  });
  viewport.on("mouseup", (event) => {
    dragging = false;
  });

  viewport.on("mousemove", (event) => {
    if (selected === clump.nodeUUID && dragging) {
      const pos = viewport.toWorld(event.global);
      const shift = new PIXI.Point(pos.x - prevMousePos.x, pos.y - prevMousePos.y);
      prevMousePos = pos;

      resClump.transform.position.x += shift.x;
      resClump.transform.position.y += shift.y;

      send("tweak", {
        nodeUUID: clump.nodeUUID,
        inputs: {
          positionX: resClump.transform.position.x,
          positionY: resClump.transform.position.y,
        },
      });
    }
  });

  // To get global mouse position at any point:
  // console.log("MOUSE", blink.renderer.plugins.interaction.pointer.global);

  clumps[clump.nodeUUID] = resClump;
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
