<script lang="ts">
    import * as PIXI from "pixi.js";
    import { Viewport } from "pixi-viewport";
    import { onDestroy, onMount } from "svelte";
    import { Writable } from "svelte/store";

    export let media: Writable<any>;

    let pixi: PIXI.Application;
    let pixiCanvas: HTMLCanvasElement;
    let mouseCursor = "cursorDefault";

    $: redraw($media);

    async function redraw(media) {
        // if (media?.ops && canvas && texture) {}
    }

    onMount(async () => {
        //====== INITIALIZE PIXI ======//
        pixi = new PIXI.Application({
            view: pixiCanvas,
            width: 500,
            height: 500,
            backgroundColor: 0x06060c,
            // transparent: true,
            antialias: true,
            resolution: 1,
            autoDensity: true,
            resizeTo: window,
        });

        if (pixi === null) {
            console.error("PIXI failed to initialize");
            return;
        }

        //====== CREATE VIEWPORT ======//
        const viewport = new Viewport({
            screenWidth: pixi.renderer.width,
            screenHeight: pixi.renderer.height,
            worldWidth: 100,
            worldHeight: 100,
            events: pixi.renderer.events,
        });

        window.addEventListener("resize", () => {
            viewport.resize(window.innerWidth, window.innerHeight, viewport.worldWidth, viewport.worldHeight);
        });

        viewport
            .drag({
                // Space + left click
                keyToPress: ["Space"],
                mouseButtons: "left",
            })
            .pinch()
            .wheel()
            .decelerate({
                friction: 0.95,
            });

        pixi.stage.addChild(viewport);

        viewport.on("drag-start", () => {
            mouseCursor = "cursorGrabbing";
        });

        viewport.on("drag-end", () => {
            mouseCursor = "default";
        });

        //===== CREATE BASE LAYOUT =====//
        const imgCanvasInitialPadding = 100;
        const imgCanvasBlockW = 1920;
        const imgCanvasBlockH = 1080;

        let imgCanvas = new PIXI.Container();

        let imgCanvasBlock = new PIXI.Graphics();
        imgCanvasBlock.beginFill(0xffffff, 0.9);
        imgCanvasBlock.drawRect(0, 0, imgCanvasBlockW, imgCanvasBlockH);

        imgCanvas.addChild(imgCanvasBlock);
        viewport.addChild(imgCanvas);

        // Place viewport such that imgCanvas is centered with padding
        const viewportFitX = imgCanvasBlockW + 2 * imgCanvasInitialPadding;
        const viewportFitY = imgCanvasBlockH + 2 * imgCanvasInitialPadding;
        viewport.fit(true, viewportFitX, viewportFitY);
        viewport.moveCenter(imgCanvasBlockW/2, imgCanvasBlockH/2);

        //===== LOAD SPRITES =====//
        // const sprites = ["media/bird.png", "media/blueArrow.png"];
        const sprites = ["media/bird.png"];
        for (let s of sprites) {
            const spriteContainer = new PIXI.Container();
            spriteContainer.sortableChildren = true;

            // Create sprite
            var sprite = PIXI.Sprite.from(s);
            sprite.scale.set(0.1);
            sprite.eventMode = "dynamic";
            sprite.on("click", (e) => { console.log(s + " click"); });

            // Create interaction box once sprite has loaded
            const box = new PIXI.Graphics();
            box.lineStyle(1, 0xf43e5c, 0.5);
            box.drawRect(0, 0, sprite.width, sprite.height);
            box.zIndex = 1000;

            spriteContainer.addChild(sprite);
            spriteContainer.addChild(box);
            box.sortChildren();

            var filter = new PIXI.BlurFilter(10, 10);
            // filter.resolution = sprite.scale.x;
            sprite.filters = [filter];

            // const renderTexture = PIXI.RenderTexture.create({ width: 100, height: 100 });
            // pixi.ticker.add((delta) => {
            //     pixi.renderer.render(sprite, renderTexture);
            // });
            // const scaleInvariantSprite = new PIXI.Sprite(renderTexture);
            // scaleInvariantSprite.scale.set(0.1);
            // imgCanvas.addChild(scaleInvariantSprite);

            // let elapsed = 0;
            // pixi.ticker.add((delta) => {
            //     elapsed += delta;
            //     const scale = 0.1 + 0.05*Math.cos(elapsed/100);
            //     sprite.scale.set(scale);
            //     // filter.blur = 100*scale;
            // });

            imgCanvas.addChild(spriteContainer);

        }

        //===== MAIN LOOP =====//
        let elapsed = 0;
        pixi.ticker.add((delta) => {
            elapsed += delta;

            // imgCanvas.angle = 100*Math.cos(elapsed/10);
        });
    });

    onDestroy(() => {});
</script>

<div class="{mouseCursor}">
    <canvas id="pixiCanvas" bind:this={pixiCanvas} />
</div>

<code>
    Media: {JSON.stringify($media)}
</code>

<style>
    canvas {
        position: absolute;
        margin: 0px;
        padding: 0px;
    }

    .cursorDefault {
        cursor: default;
    }
    .cursorPointer {
        cursor: pointer;
    }
    .cursorGrab {
        cursor: grab;
    }
    .cursorGrabbing {
        cursor: grabbing;
    }

    code {
        position: absolute;
        bottom: 0px;
        right: 0px;
        z-index: 10;
        color: white;
    }
</style>