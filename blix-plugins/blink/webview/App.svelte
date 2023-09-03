<script lang="ts">
    import * as PIXI from "pixi.js";
    import { Viewport } from "pixi-viewport";
    import { onDestroy, onMount } from "svelte";
    import { Writable } from "svelte/store";
    import { renderApp } from "./render";
    import { canvas1 } from "./clump";

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

        const hierarchy = new PIXI.Container();
        viewport.addChild(imgCanvas);
        viewport.addChild(hierarchy);

        // Place viewport such that imgCanvas is centered with padding
        const viewportFitX = imgCanvasBlockW + 2 * imgCanvasInitialPadding;
        const viewportFitY = imgCanvasBlockH + 2 * imgCanvasInitialPadding;
        viewport.fit(true, viewportFitX, viewportFitY);
        viewport.moveCenter(imgCanvasBlockW/2, imgCanvasBlockH/2);

        //===== RENDER Blink =====//
        renderApp(blink, hierarchy, $media);
        media.subscribe((media) => {
            renderApp(blink, hierarchy, media);
        });

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
    <!-- {JSON.stringify($media, null, 2)} -->
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
        white-space: break-spaces;
        pointer-events: none;
        top: 1.2em;
        z-index: 10;
        font-size: 0.2em;
        color: white;
        height: 100%;
    }
</style>