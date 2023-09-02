import * as PIXI from "pixi.js";
import { type Atom, type Clump } from "./clump";
import { Viewport } from "pixi-viewport";

export function renderApp(pixi: PIXI.Application, viewport: Viewport, root: Clump) {
    viewport.addChild(renderClump(pixi, root));
}

export function renderCanvas(pixi: PIXI.Application, root: Clump) {
}

function renderClump(blink: PIXI.Application, clump: Clump) {
    // Create container
    const container = new PIXI.Container();
    container.sortableChildren = true;
    // container.eventMode = "dynamic";
    // container.on("click", (e) => { console.log(container + " click"); });

    const renderTexture = PIXI.RenderTexture.create({ width: 800, height: 600 });

    // Create child elements
    if (clump.elements) {
        for (let child of clump.elements) {
            if (child.class === "clump") {
                // container.addChild(renderClump(pixi, child));
            } else if (child.class === "atom") {
                container.addChild(renderAtom(child));
            }
        }
    }

    // Create interaction box once sprite has loaded
    // const box = new PIXI.Graphics();
    // box.lineStyle(1, 0xf43e5c, 0.5);
    // box.drawRect(0, 0, sprite.width, sprite.height);
    // box.zIndex = 1000;

    // spriteContainer.addChild(box);
    // box.sortChildren();

    var filter1 = new PIXI.BlurFilter(100, 10);
    var filter2 = new PIXI.NoiseFilter(0.5);
    container.filters = [filter1];

    setTimeout(() => {
        blink.renderer.render(container, { renderTexture: renderTexture });
    }, 100);

    const renderrSprite = new PIXI.Sprite(renderTexture);
    renderrSprite.position.set(-100, -100);

    return renderrSprite;
}

function renderAtom(atom: Atom) {
    switch(atom.type) {
        case "image":
            const sprite = PIXI.Sprite.from("media/bird.png");

            sprite.position.x = 800 / 2;
            sprite.position.y = 600 / 2;
            sprite.anchor.x = 0.5;
            sprite.anchor.y = 0.5;

            return sprite;

        case "shape":
            break;
        case "text":
            break;
        case "paint":
            break;
    }
}