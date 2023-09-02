import * as PIXI from "pixi.js";
import { getPixiFilter, type Atom, type Clump, BlinkCanvas, Asset } from "./clump";
import { Viewport } from "pixi-viewport";

export function renderApp(blink: PIXI.Application, viewport: Viewport, canvas: BlinkCanvas) {
    // Preload all image assets
    const imgPromises = [];
    for (let assetId in canvas.assets) {
        if (canvas.assets[assetId].type === "image") {
            imgPromises.push(PIXI.Assets.load(canvas.assets[assetId].data));
        }
    }

    // Construct clump hierarchy
    Promise.all(imgPromises).then(() => {
        viewport.addChild(renderClump(blink, canvas.content, canvas));
    });
}

export function renderCanvas(blink: PIXI.Application, root: Clump) {
}

function renderClump(blink: PIXI.Application, clump: Clump, canvas: BlinkCanvas) {
    // Create container
    const content = new PIXI.Container();
    content.sortableChildren = true;

    // Create child elements
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

    // Create interaction box once sprite has loaded
    content.sortChildren();

    const resClump = new PIXI.Container();
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
        const renderTexture = PIXI.RenderTexture.create({ width: bw + 2*renderPadding, height: bh + 2*renderPadding });
        blink.renderer.render(content, { renderTexture: renderTexture });

        // Create flattened sprite and add to clump
        const renderSprite = new PIXI.Sprite(renderTexture);
        renderSprite.setTransform(bx - renderPadding, by - renderPadding);


        resClump.addChild(renderSprite);
    }
    else {
        //===== ADD CONTENT WITHOUT FLATTENING =====//
        resClump.addChild(content);
    }

    const clumpBounds = resClump.getBounds();

    const box = new PIXI.Graphics();
    box.lineStyle(5, 0xf43e5c, 0.5);
    box.drawRect(clumpBounds.x, clumpBounds.y, clumpBounds.width, clumpBounds.height);

    box.lineStyle();
    box.beginFill(0xf43e5c, 1);
    box.drawCircle(clumpBounds.x, clumpBounds.y, 10);
    box.drawCircle(clumpBounds.x + clumpBounds.width, clumpBounds.y, 10);
    box.drawCircle(clumpBounds.x, clumpBounds.y + clumpBounds.height, 10);
    box.drawCircle(clumpBounds.x + clumpBounds.width, clumpBounds.y + clumpBounds.height, 10);
    box.zIndex = 1000;

    resClump.addChild(box);
    resClump.sortChildren();

    resClump.eventMode = "dynamic";
    resClump.on("click", () => { console.log(clump.name + " click"); });

    return resClump;
}

function renderAtom(assets: { [key: string]: Asset }, atom: Atom) {
    switch(atom.type) {
        case "image":
            if (assets[atom.assetId] && assets[atom.assetId].type === "image") {
                const sprite = PIXI.Sprite.from(assets[atom.assetId].data);

                sprite.anchor.x = 0.5;
                sprite.anchor.y = 0.5;

                return sprite;
            }

            return null;

        case "shape":
            const shape = new PIXI.Graphics();
            shape.lineStyle(1, 0xf43e5c, 0.5);
            shape.drawRect(-100, -100, 100, 100);
            return shape;

        case "text":
            break;

        case "paint":
            break;
    }
}