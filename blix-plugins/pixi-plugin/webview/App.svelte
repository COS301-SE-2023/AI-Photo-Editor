<script lang="ts">
    import * as PIXI from "pixi.js";
    import { Viewport } from "pixi-viewport";
    import { onDestroy, onMount } from "svelte";
    import { Writable } from "svelte/store";
    import { root1 } from "./clump";
    import { renderApp } from "./render";

    export let media: Writable<any>;

    let blink: PIXI.Application;
    let pixiCanvas: HTMLCanvasElement;
    let mouseCursor = "cursorDefault";

    $: redraw($media);

    async function redraw(media) {
        // if (media?.ops && canvas && texture) {}
    }

    onMount(async () => {
        //====== INITIALIZE PIXI ======//
        blink = new PIXI.Application({
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

        if (blink === null) {
            console.error("PIXI failed to initialize");
            return;
        }

        //====== CREATE VIEWPORT ======//
        const viewport = new Viewport({
            screenWidth: blink.renderer.width,
            screenHeight: blink.renderer.height,
            worldWidth: 100,
            worldHeight: 100,
            events: blink.renderer.events,
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

        blink.stage.addChild(viewport);

        viewport.on("drag-start", () => {
            mouseCursor = "cursorGrabbing";
        });

        viewport.on("drag-end", () => {
            mouseCursor = "";
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
        // const sprites = ["media/bird.png"];
        const sprites = [];
        for (let s of sprites) {
            // const spriteContainer = new PIXI.Container();
            // spriteContainer.sortableChildren = true;

            // Create sprite
            var sprite = PIXI.Sprite.from(s);
            // sprite.scale.set(0.1);
            sprite.eventMode = "dynamic";
            sprite.on("click", (e) => { console.log(s + " click"); });
        }

        renderApp(blink, viewport, root1);

        // const renderTex = PIXI.RenderTexture.create({ width: 800, height: 600 });
        // const spr = PIXI.Sprite.from("media/bird.png");

        // var filter = new PIXI.BlurFilter(100, 10);
        // spr.filters = [filter];

        // spr.position.x = 800 / 2;
        // spr.position.y = 600 / 2;
        // spr.anchor.x = 0.5;
        // spr.anchor.y = 0.5;

        // setTimeout(() => {
        //     pixi.renderer.render(spr, { renderTexture: renderTex });
        // }, 100);

        // const renderrSprite = new PIXI.Sprite(renderTex);
        // renderrSprite.position.set(-100, -100);
        // viewport.addChild(renderrSprite);

        //===== MAIN LOOP =====//
        let elapsed = 0;
        blink.ticker.add((delta) => {
            elapsed += delta;
        });
    });

    onDestroy(() => {});

    function keydown(e: KeyboardEvent) {
        if (e.key === " ") {
            mouseCursor = "cursorGrab";
        }
    }

    function keyup(e: KeyboardEvent) {
        if (e.key === " ") {
            mouseCursor = "";
        }
    }
</script>

<svelte:window on:keydown={keydown} on:keyup={keyup} />
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