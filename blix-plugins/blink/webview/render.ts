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

export function randomId() {
  return Math.random().toString(36).slice(2, 6);
}

// let prevMedia = null; // TODO: Replace with DiffDial

// Utility type to override properties of T with properties of R
type Override<T, R> = { [P in Exclude<keyof T, keyof R>]: T[P] } & R;

type HierarchyData = { container: PIXI.Container };

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
  console.log("====================================");

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
  if (!clump) {
    console.log("------------------------------------");
    return { pixiClump: null, changed: prevClump != null };
  }
  console.log("PREVCLUMP EXISTS", prevClump?.container != null)

  //========== DIFF CLUMP VS HIERARCHY ==========//
  const diffs = diffClump(clump, prevClump);

  //========== CREATE CHILD ELEMENTS ==========//
  let childChanged = false;
  const children: { changed: boolean, child: PIXI.Container }[] = [];
  const hierarchyElements = [];

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

        // Construct hierarchy clump
        const hierarchyClump = child as HierarchyClump;
        hierarchyClump.container = pixiClump;
        hierarchyElements.push(hierarchyClump);

        childChanged ||= changed;

        if (pixiClump != null) {
          children.push({ changed, child: pixiClump });
          // content.addChild(pixiClump);
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
        const hierarchyAtom = child as HierarchyAtom;
        hierarchyAtom.container = pixiAtom;
        hierarchyElements.push(hierarchyAtom);

        childChanged ||= changed;

        if (pixiAtom != null) {
          children.push({ changed, child: pixiAtom });
          // content.addChild(pixiAtom);
        }
      }
    }
    console.log("-> CHILDREN", children);
  }

  //========== OBTAIN CLUMP CONTAINER ==========//
  let resClump: PIXI.Container;
  let content: PIXI.Container;
  const newContainer = prevClump?.container == null;

  // Create resClump
  if (newContainer) {
    resClump = new PIXI.Container();
    resClump.name = `Clump(${randomId()})`;
    // resClump.sortableChildren = true;
    addInteractivity(resClump, clump, viewport, send);

  } else { resClump = prevClump.container; }

  // Add content
  if (resClump.children.length === 0) {
    content = new PIXI.Container();
    content.name = `content(${randomId()})`;
    content.sortableChildren = true;

    resClump.addChild(content);
  } else { content = resClump.getChildAt(0) as PIXI.Container; }

  console.log(`==> ${newContainer ? "" : "NO "}NEW RESCLUMP (${resClump.name.split("(")[1].slice(0, 4)})`);

  if (childChanged || diffs.has("filters")) {
    //========== BUILD CONTENT ==========//

    //Add children to content
    if (newContainer) {
      for (let i = 0; i < children.length; i++) {
        children[i].child.zIndex = children.length - i;
        console.log("=====> ADD CHILD", i, children[i].child.name);
        content.addChild(children[i].child);
      }
    } else {
      for (let i = 0; i < children.length; i++) {
        children[i].child.zIndex = children.length - i;
        // Only update if child changed
        if (children[i].changed) {
          console.log("=====> UPDATE CHILD", i, children[i].child.name);
          // const prevChild = content.removeChildAt(i) as PIXI.Container;
          // console.log("OLD CHILD", prevChild.name, "NEW CHILD", children[i].child.name)
          // content.addChildAt(children[i].child, i);
          // children[i].child.addChild(prevChild.getChildAt(prevChild.children.length - 1));
        }
      }
    }

    if (false && !newContainer) {
      // Remove redundant surplus children
      if (prevClump?.elements) {
        for (let i = clump.elements.length + 1; i < prevClump.elements.length; i++) {
          if (prevClump.elements[i].class === "clump") {
            const pClump = prevClump.elements[i] as HierarchyClump;
            console.log("REMOVE CLUMP CHILD");
            prevClump.container.removeChild(pClump.container);
          } else if (prevClump.elements[i].class === "atom") {
            const pAtom = prevClump.elements[i] as HierarchyAtom;
            console.log("REMOVE ATOM CHILD");
            prevClump.container.removeChild(pAtom.container);
          }
        }
      }
    }

    content.sortChildren();

    if (clump.filters && clump.filters.length > 0)
    {
      //===== FILTERS =====//
      resClump.addChild(applyFilters(blink, content, clump.filters));
    }
    else
    {
      //===== ADD CONTENT WITHOUT FLATTENING =====//
      if (childChanged) {
        console.log("RESCLUMP CHILDREN", resClump.children);
        // if (newContainer) {
        //   resClump.addChild(content);
        // }
      }
    }
  }

  // Get bounds before applying transform
  const clumpBounds = resClump.getBounds();

  //========== APPLY CLUMP PROPERTIES ==========//
  if (diffs.has("transform")) {
    console.log("UPDATE TRANSFORM", resClump.name.split("(")[1].slice(0, 4));
    let transMatrix = PIXI.Matrix.IDENTITY;
    if (clump.transform) {
      const { position: pos, rotation: rot, scale: scl } = clump.transform;

      if (scl) transMatrix.scale(scl.x, scl.y);
      if (rot) transMatrix.rotate((rot * Math.PI) / 180);
      if (pos) transMatrix.translate(pos.x, pos.y);
    }

    resClump.transform.setFromMatrix(transMatrix);
    // const matTransform = resClumpContent.transform.worldTransform;
  }

  if (diffs.has("opacity")) {
    if (clump.opacity) {
      resClump.alpha = Math.min(1, Math.max(0, clump.opacity / 100.0));
    }
  }

  resClump.sortChildren();

  // boundingBox.addChild(createBoundingBox(transMatrix, resClump.getBounds(), viewport));

  if (prevClump != null) {
    prevClump.container = resClump;
  }
  // console.log("--> RESULT", resClump, "\n\n--> CHILD CHANGED", childChanged, "\n\n--> DIFFS", diffs);

  console.log("------------------------------------");
  return {
    pixiClump: resClump,
    changed: childChanged || diffs.size > 0,
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
      // const pos = viewport.worldTransform.apply(event.global);
      const shift = new PIXI.Point(pos.x - prevMousePos.x, pos.y - prevMousePos.y);
      prevMousePos = pos;

      container.transform.position.x += shift.x;
      container.transform.position.y += shift.y;
    }
  });

  // To get global mouse position at any point:
  // console.log("MOUSE", blink.renderer.plugins.interaction.pointer.global);
}