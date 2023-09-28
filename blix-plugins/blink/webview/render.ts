import * as PIXI from "pixi.js";
import {
  getPixiFilter,
  type Atom,
  type Clump,
  type BlinkCanvas,
  type WindowWithApis,
} from "./types";
import { Viewport } from "pixi-viewport";
import { createBoundingBox } from "./select";
import { renderAtom } from "./atom";
import { applyFilters } from "./filter";
import { diffClump } from "./diff";
import { tick } from "svelte";

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

type SelectionState = {
  uuid: string, // NodeUUID of selected clump
  container: PIXI.Container,
  dragging: boolean,
  prevMousePos: PIXI.Point
};

const MAX_CHILDREN_IN_CLUMP = 50;

let selection: SelectionState = null;

let oldSceneStructure = "";
let sceneStructure = "_";

let boundingBox: PIXI.Container = null;
let scene: PIXI.Container;

let hierarchy: HierarchyCanvas | undefined = undefined;

const textures: { [key: string]: PIXI.Texture<PIXI.Resource> } = {}

export async function renderScene(
  blink: PIXI.Application,
  canvas: BlinkCanvas,
  viewport: Viewport,
  send: (message: string, data: any) => void
): Promise<{ success: boolean; scene: PIXI.Container }> {
  console.log("====================================");

  if (!canvas || !canvas.content) return { success: false, scene: null };
  if (!scene) {
    scene = new PIXI.Container();
    scene.name = "Blink Scene";
    viewport.addChild(scene);
  }

  if (!boundingBox) {
    //===== CREATE BOUNDING BOX =====//
    boundingBox = new PIXI.Container();
    boundingBox.name = "boundingBox";

    window.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        selection = null;
      }
    });

    blink.stage.addChild(boundingBox);

    blink.ticker.add(() => {
      if (boundingBox.children) {
        boundingBox.removeChildren();
      }

      if (selection?.uuid) {
        boundingBox.addChild(createBoundingBox(selection.container.transform.localTransform, selection.container.getLocalBounds(), viewport, selection.container.transform.pivot));
        // boundingBox.addChild(createBoundingBox(selection.container.transform.worldTransform, selection.container.getBounds(), viewport));
      }
    });
  }

  //===== PRELOAD IMAGE ASSETS =====//
  const imgPromises = [];
  for (let assetId in canvas.assets) {
    if (canvas.assets[assetId].type === "image") {
      const cacheId = canvas.assets[assetId].data as string;
      if (textures[cacheId] != null) continue;

      // Get cache object
      imgPromises.push(new Promise<void>(async (resolve, reject) => {
        const blob: Blob = await (window as WindowWithApis).cache.get(cacheId);
        const url = window.URL.createObjectURL(blob);
        console.log("BLOB", blob);
        console.log("URL", url);

        // To get a list of all available loadParsers:
        // console.log("PARSERS", PIXI.Assets.loader.parsers);

        // Also make note of:
        //    PIXI.Assets.add(cacheId, url);
        //    await PIXI.Assets.loader.load(url);

        // NOTE:
        // There is currently a bug with Pixi.js v5.2.4 where Blob URLs fail to load
        // on the first frame, and awaiting the load() function has no effect.
        // See: [https://github.com/pixijs/pixijs/issues/9568]

        // This issue has been fixed in Pixi.js v5.3.1
        // See: [https://github.com/pixijs/pixijs/pull/9634]
        // However, v5.3.1 is currently incompatible with the pixi-viewport plugin,
        // So we'll have to use the below setTimeout() temp fix until pixi-viewport is upgraded.

        // PREFERABLE IMPLEMENTATION AFTER UPGRADE:
        // const asset = await PIXI.Assets.load({ src: url });
        // textures[cacheId] = url;

        textures[cacheId] = PIXI.Texture.from(url);
        resolve();
      }));
    }
  }

  // Construct clump hierarchy
  await Promise.all(imgPromises);
  if (imgPromises.length > 0) {
    await new Promise((resolve, reject) => setTimeout(resolve, 50));
  }

  // Reset selection
  // selection = null;

  const { pixiClump, changed } = renderClump(
    blink,
    0,
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
    config: undefined,
    content: {
      ...canvas.content,
      container: pixiClump,
    } as HierarchyClump,
  };

  if (hierarchy.content.container != null && changed) {
    scene.addChild(hierarchy.content.container);
  }

  return { success: true, scene };
}

export function renderCanvas(blink: PIXI.Application, root: Clump) {}

function renderClump(
  blink: PIXI.Application,
  index: number,
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
    for (let i = 0; i < MAX_CHILDREN_IN_CLUMP; i++) {
      const child = clump.elements[i];
      const prevChild = prevClump?.elements != null && prevClump.elements[i];

      if (child == null) {
        //===== REMOVED CHILD =====//
        if (prevChild) {
          console.log("----> DELETED CHILD", i);
          childChanged = true;
          children.push({ changed: true, child: null });
        }
      }
      else if (child.class === "clump") {
        //===== CHILD CLUMP =====//
        const { pixiClump, changed } = renderClump(
          blink,
          i,
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
          (prevChild?.class === "atom" ? prevChild : undefined) as HierarchyAtom,
          textures
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
    resClump.name = `Clump[${index}](${randomId()})`;
    // resClump.sortableChildren = true;
    addInteractivity(resClump, clump, viewport, send);

  } else { resClump = prevClump.container; }

  // Add content
  const prevContent = findChild(resClump, "content");
  if (prevContent == null) {
    content = new PIXI.Container();
    content.name = `content(${randomId()})`;
    content.sortableChildren = true;

    resClump.addChild(content);
  } else { content = prevContent as PIXI.Container; }
  content.visible = true;

  console.log(`==> ${newContainer ? "" : "NO "}NEW RESCLUMP (${resClump.name.split("(")[1].slice(0, 4)})`);

  if (childChanged || newContainer || diffs.has("filters")) {
    //========== BUILD CONTENT ==========//

    //Add children to content
    if (true || newContainer) {
      content.removeChildren();
      for (let i = 0; i < children.length; i++) {
        if (children[i].child == null) continue;
        children[i].child.zIndex = children.length - i;
        console.log("=====> ADD CHILD", i, children[i].child.name);
        content.addChild(children[i].child);
      }
    } else {
      // TODO: Fix this so it only replaces changed children / removes excess
      // Above is a temp fix that removes all children and adds everything back

      for (let i = 0; i < children.length; i++) {
        children[i].child.zIndex = children.length - i;
        // Only update if child changed
        if (children[i].changed) {
          console.log("=====> UPDATE CHILD", i, children[i].child.name);
          // content.children[i] = children[i].child;
          content.removeChildAt(i);
          content.addChildAt(children[i].child, i);
          // content.addChild(children[i].child);
        }
      }

      // Remove redundant surplus children
      // content.children.splice(children.length, content.children.length - children.length);
      // for (let i = content.children.length-1; i >= children.length; i--) {
      //   console.log("=====> REMOVE CHILD", i, content.children[i].name);
      //   content.removeChildAt(i);
      // }
    }

    content.sortChildren();

    if ((diffs.has("filters") || childChanged) && clump.filters && clump.filters.length > 0)
    {
      //===== FILTERS =====//
      console.log("APPLY FILTER", content.name);
      const filterSprite = applyFilters(blink, content, clump.filters);
      // resClump.addChildAt(content, 0);
      if (resClump.children.length > 1) {
        resClump.removeChildAt(1);
      }
      resClump.addChildAt(filterSprite, 1);
    }
    else
    {
      //===== ADD CONTENT WITHOUT FLATTENING =====//
      if (childChanged) {
        console.log("RESCLUMP CHILDREN", resClump.children);
      }
    }
  }

  let appliedFilter = false;
  for (let i = 0; i < resClump.children.length; i++) {
    if (resClump.children[i].name.includes("FilterSprite")) {
      appliedFilter = true;
      break;
    }
  }
  if (findChild(resClump, "FilterSprite") != null) {
    // If we've applied a filter (potentially in a previous step), hide the content
    content.visible = false;
  }

  // Get bounds before applying transform
  const clumpBounds = resClump.getBounds();
  // TODO: Optimize with resClump._bounds.getRectangle() on children,
  // to avoid recalculating all the way down the hierarchy
  // Also: Look into .getLocalBounds() instead

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
      resClump.alpha = Math.min(1, Math.max(0, clump.opacity));
    }
  }

  if (diffs.has("mask")) {
    const mask = clump.mask != null ? renderClump(
      blink,
      0,
      clump.mask,
      undefined,
      canvas,
      undefined,
      viewport,
      () => {}
    ).pixiClump : null;

    if (mask) {
      const { x: bx, y: by, width: bw, height: bh } = mask.getLocalBounds();
      const renderPadding = 0;
      mask.transform.position.x = -bx + renderPadding;
      mask.transform.position.y = -by + renderPadding;

      // Render to texture
      const renderTexture = PIXI.RenderTexture.create({ width: bw + 2 * renderPadding, height: bh + 2 * renderPadding, });
      blink.renderer.render(mask, { renderTexture: renderTexture });

      mask.transform.setFromMatrix(new PIXI.Matrix());

      // Create flattened sprite
      const renderSprite = new PIXI.Sprite(renderTexture);
      renderSprite.name = `FilterSprite(${randomId()})`
      // renderSprite.anchor.x = 0.5;
      // renderSprite.anchor.y = 0.5;
      renderSprite.setTransform(bx - renderPadding, by - renderPadding);

      // TODO: Add a separate child container to the clump to
      // be used specifically for masking
      resClump.addChild(renderSprite);
      resClump.mask = renderSprite;
    }
    else {
      resClump.mask = null;
    }
  }

  resClump.sortChildren();

  if (prevClump != null) {
    prevClump.container = resClump;
  }

  console.log("------------------------------------");
  return {
    pixiClump: resClump,
    changed: childChanged || diffs.size > 0,
  };
}


function addInteractivity(container: PIXI.Container, clump: Clump, viewport: Viewport, send: (message: string, data: any) => void) {
  container.eventMode = "dynamic";

  container.on("mousedown", (event) => {
    event.stopPropagation();

    // Create new selection
    selection = {
      uuid: clump.nodeUUID,
      container,
      dragging: true,
      prevMousePos: viewport.toWorld(event.global)
    };
  });

  viewport.on("mouseup", (event) => {
    if (selection?.uuid === clump.nodeUUID) {
      event.stopPropagation();
      if (selection.dragging) {
        send("tweak", {
          nodeUUID: clump.nodeUUID,
          inputs: {
            positionX: container.transform.position.x,
            positionY: container.transform.position.y
          },
        });
        selection.dragging = false;
        console.log("MOUSE UP", selection);
      }
    }
  });

  viewport.on("mousemove", (event) => {
    if (selection?.uuid === clump.nodeUUID && selection?.dragging) {
      // boundingBox.removeChildren();
      // boundingBox.addChild(createBoundingBox(container.transform.worldTransform, container.getBounds(), viewport));

      const pos = viewport.toWorld(event.global);
      // const pos = viewport.worldTransform.apply(event.global);
      const shift = new PIXI.Point(
        pos.x - selection.prevMousePos.x,
        pos.y - selection.prevMousePos.y
        );
      selection.prevMousePos = pos;

      container.transform.position.x += shift.x;
      container.transform.position.y += shift.y;
    }
  });

  // To get global mouse position at any point:
  // console.log("MOUSE", blink.renderer.plugins.interaction.pointer.global);
}

function findChild(container: PIXI.Container, namePrefix: string): PIXI.DisplayObject | null {
  for (let i = 0; i < container.children.length; i++) {
    if (container.children[i].name.includes(namePrefix)) {
      return container.children[i];
    }
  }
  return null;
}