import * as PIXI from "pixi.js";
import {
  getPixiFilter,
  type Atom,
  type Clump,
  type BlinkCanvas,
  type Asset,
  Filter,
  Transform,
} from "./types";
import { Viewport } from "pixi-viewport";
import { createBoundingBox } from "./select";
import { renderAtom } from "./atom";
import { applyFilters } from "./filter";
import { diffAtom, diffClump } from "./diff";

// let prevMedia = null; // TODO: Replace with DiffDial

// Utility type to override properties of T with properties of R
type Override<T, R> = { [P in Exclude<keyof T, keyof R>]: T[P] } & R;

type HierarchyData = { container: PIXI.Container; containerIndex: number };

export type HierarchyCanvas = Override<BlinkCanvas, { content: HierarchyClump | null }>;
export type HierarchyClump = Override<Clump, { elements: (HierarchyClump | HierarchyAtom)[] }> &
  HierarchyData;
export type HierarchyAtom = Atom & HierarchyData;
// type Clumps = { [key: string]: PIXI.Container };

let selected: string = ""; // NodeUUID of selected clump

let oldSceneStructure = "";
let sceneStructure = "_";

let boundingBox: PIXI.Container = null;
let scene: PIXI.Container;

let hierarchy: HierarchyCanvas | undefined = undefined;

export function renderApp(
  blink: PIXI.Application,
  canvas: BlinkCanvas,
  viewport: Viewport,
  send: (message: string, data: any) => void
): boolean {
  if (!canvas || !canvas.content) return false;
  if (!scene) {
    scene = new PIXI.Container();
    scene.name = "Blink Scene";
    viewport.addChild(scene);
  }

  // Destroy previous viewport contents
  // scene.removeChildren();
  // if (boundingBox) {
  //   boundingBox.removeChildren();
  // }

  //===== CREATE BOUNDING BOX =====//
  // TODO
  if (boundingBox == null) {
    boundingBox = new PIXI.Container();
    boundingBox.name = "boundingBox";
    blink.stage.addChild(boundingBox);
  }

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
    const { pixiClump, changed } = renderClump(
      blink,
      canvas.content,
      hierarchy?.content,
      canvas,
      hierarchy,
      viewport,
      send
    );

    // Update hierarchy
    hierarchy = {
      assets: canvas.assets,
      content: {
        ...canvas.content,
        container: pixiClump,
        containerIndex: 0,
      } as HierarchyClump,
    };

    if (hierarchy.content.container != null && changed) {
      scene.addChild(hierarchy.content.container);
    }

    //===============// DELETE DEAD CLUMPS //==============//
    // const newClumps = new Set(Object.keys(scene));

    // for (let nodeUUID in oldScene) {
    //   if (!newClumps.has(nodeUUID)) {
    //     oldScene[nodeUUID].destroy(); // PIXI.js cleanup
    //   }
    // }
    // console.log("CLUMPS", clumps);
    // console.log("SCENE", scene);
    console.log("====================================");
  });

  return true;
}

export function renderCanvas(blink: PIXI.Application, root: Clump) {}

function renderClump(
  blink: PIXI.Application,
  clump: Clump,
  prevClump: HierarchyClump | undefined,
  canvas: BlinkCanvas,
  prevCanvas: BlinkCanvas,
  viewport: Viewport,
  send: (message: string, data: any) => void
): {
  pixiClump: PIXI.Container;
  changed: boolean; // Whether the pixiClump is a different PIXI object than before
} {
  if (!clump) return { pixiClump: null, changed: prevClump != null };

  //========== DIFF CLUMP VS HIERARCHY ==========//
  const diffs = diffClump(clump, prevClump);
  // console.log("DIFFS", diffs);

  //========== CREATE CHILD ELEMENTS ==========//
  let childChanged = false;
  const children: PIXI.Container[] = [];

  if (clump.elements) {
    for (let i = 0; i < clump.elements.length; i++) {
      const child = clump.elements[i];
      const prevChild = prevClump?.elements != null && prevClump.elements[i];

      if (child.class === "clump") {
        //===== CHILD CLUMP =====//
        const { pixiClump, changed } = renderClump(
          blink,
          child as HierarchyClump,
          (prevChild?.class === "clump" ? prevChild : undefined) as HierarchyClump,
          canvas,
          prevCanvas,
          viewport,
          send
        );

        if (changed) {
          childChanged = true;
          // console.log("CREATE CLUMP", pixiClump);
          if (pixiClump != null) {
            children.push(pixiClump);
            // content.addChild(pixiClump);
          }

          // Destroy previous contents
          // console.log("DESTROY CLUMP", prevChild?.container);
          prevChild?.container?.destroy();
        }
      } else if (child.class === "atom") {
        //===== CHILD ATOM =====//
        const { pixiAtom, changed } = renderAtom(
          canvas.assets,
          prevCanvas?.assets,
          child,
          (prevChild?.class === "atom" ? prevChild : undefined) as HierarchyAtom
        );

        // Construct hierarchy atom
        // const hierarchyAtom = child as HierarchyAtom;
        // hierarchyAtom.container = pixiAtom;
        // hierarchyAtom.containerIndex = i;
        // hierarchy.elements.push(hierarchyAtom);

        // console.log("PIXI ATOM", hierarchyAtom);

        if (changed) {
          childChanged = true;
          // console.log("CREATE ATOM", pixiAtom);
          // content.removeChild(pixiAtom);
          if (pixiAtom != null) {
            children.push(pixiAtom);
            // content.addChild(pixiAtom);
          }

          // Destroy previous contents
          // console.log("DESTROY ATOM", prevChild?.container);
          prevChild?.container?.destroy();
        }
      }
    }

    // Remove previous surplus children
    if (prevClump?.elements) {
      for (let i = clump.elements.length + 1; i < prevClump.elements.length; i++) {
        if (prevClump.elements[i].class === "clump") {
          const pClump = prevClump.elements[i] as HierarchyClump;
          // console.log("REMOVE CLUMP CHILD");
          prevClump.container.removeChild(pClump.container);
        } else if (prevClump.elements[i].class === "atom") {
          const pAtom = prevClump.elements[i] as HierarchyAtom;
          // console.log("REMOVE ATOM CHILD");
          prevClump.container.removeChild(pAtom.container);
        }
      }
    }
  }

  //========== OBTAIN CLUMP CONTAINER ==========//
  let resClump: PIXI.Container;
  if (prevClump?.container) {
    resClump = prevClump.container;
    // TODO: Destroy previous contents
  } else {
    resClump = new PIXI.Container();
    resClump.name = "Clump";
    resClump.sortableChildren = true;

    addInteractivity(resClump, clump, viewport, send);
  }

  if (childChanged || diffs.has("filters")) {
    //========== RECREATE CONTENT ==========//
    let content = new PIXI.Container();
    content = new PIXI.Container();
    content.name = "content";
    content.sortableChildren = true;

    // TODO: Only add children that have changed
    // Also remove redundant children

    //Add children to content
    for (let i = 0; i < children.length; i++) {
      children[i].zIndex = children.length - i;
      content.addChild(children[i]);
    }

    content.sortChildren();

    //========== APPLY FILTERS ==========//
    if (clump.filters && clump.filters.length > 0) {
      resClump.addChild(applyFilters(blink, content, clump.filters));
    } else {
      //===== ADD CONTENT WITHOUT FLATTENING =====//
      if (childChanged) {
        // resClump.removeChildren();
        resClump.addChild(content);
      }
    }
  }

  // Get bounds before applying transform
  const clumpBounds = resClump.getBounds();

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
    resClump.alpha = Math.min(1, Math.max(0, clump.opacity / 100.0));
  }

  resClump.sortChildren();

  // boundingBox.addChild(createBoundingBox(transMatrix, resClump.getBounds(), viewport));

  // hierarchy.container = resClump;
  return {
    pixiClump: resClump,
    changed: true,
  };
}


function addInteractivity(container: PIXI.Container, clump: Clump, viewport: Viewport, send: (message: string, data: any) => void) {
  let dragging = false;
  var prevMousePos = new PIXI.Point();

  container.eventMode = "dynamic";
  // resClump.on("click", () => {
  // });

  container.on("mousedown", (event) => {
    event.stopPropagation();
    selected = clump.nodeUUID;
    dragging = true;
    prevMousePos = viewport.toWorld(event.global);
  });
  viewport.on("mouseup", (event) => {
    if (selected === clump.nodeUUID && dragging) {
      send("tweak", {
        nodeUUID: clump.nodeUUID,
        inputs: {
          positionX: container.transform.position.x,
          positionY: container.transform.position.y
        },
      });
    }

    dragging = false;
  });

  viewport.on("mousemove", (event) => {
    if (selected === clump.nodeUUID && dragging) {
      // boundingBox.removeChildren();
      // boundingBox.addChild(createBoundingBox(container.transform.worldTransform, container.getBounds(), viewport));

      const pos = viewport.toWorld(event.global);
      const shift = new PIXI.Point(pos.x - prevMousePos.x, pos.y - prevMousePos.y);
      prevMousePos = pos;

      container.transform.position.x += shift.x;
      container.transform.position.y += shift.y;

      // send("tweak", {
      //   nodeUUID: clump.nodeUUID,
      //   inputs: {
      //     // positionX: container.transform.position.x + shift.x,
      //     // positionY: container.transform.position.y + shift.y
      //     positionX: container.transform.position.x,
      //     positionY: container.transform.position.y
      //   },
      // });
    }
  });

  // To get global mouse position at any point:
  // console.log("MOUSE", blink.renderer.plugins.interaction.pointer.global);
}