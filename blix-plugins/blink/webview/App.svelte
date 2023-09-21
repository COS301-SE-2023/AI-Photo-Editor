<script lang="ts">
    import * as PIXI from "pixi.js";
    import { Viewport } from "pixi-viewport";
    import { onDestroy, onMount, tick } from "svelte";
    import { type Writable } from "svelte/store";
    import { renderApp } from "./render";
    import { type BlinkCanvas } from "./types";
    import Debug from "./Debug.svelte";

    export let media: Writable<BlinkCanvas>;
    export let send: (msg: string, data: any) => void;

    let blink: PIXI.Application;
    let pixiCanvas: HTMLCanvasElement;
    let mouseCursor = "cursorDefault";

    onMount(async () => {
    // window.addEventListener("DOMContentLoaded", async () => {
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
            // autoStart: false,
            // resizeTo: window,
        });

        globalThis.__PIXI_APP__ = blink;

        window.addEventListener("resize", () => {
            blink.renderer.resize(window.innerWidth, window.innerHeight);
            blink.render();
        });

        if (blink === null) {
            console.error("PIXI failed to initialize");
            return;
        }

        //====== CREATE VIEWPORT ======//
        const viewport = new Viewport({
            screenWidth: pixiCanvas.width,
            screenHeight: pixiCanvas.height,
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
        imgCanvas.name = "imgCanvas";

        // canvas
        let imgCanvasBlock = new PIXI.Graphics();
        imgCanvasBlock.beginFill(0xffffff, 0.9);
        imgCanvasBlock.drawRect(0, 0, imgCanvasBlockW, imgCanvasBlockH);

        // x-axis
        imgCanvasBlock.lineStyle();
        imgCanvasBlock.moveTo(0, imgCanvasBlockH/2);
        imgCanvasBlock.lineStyle(1, 0xff0000);
        imgCanvasBlock.lineTo(imgCanvasBlockW, imgCanvasBlockH/2);

        // y-axis
        imgCanvasBlock.lineStyle();
        imgCanvasBlock.moveTo(imgCanvasBlockW/2, 0);
        imgCanvasBlock.lineStyle(1, 0x00ff00);
        imgCanvasBlock.lineTo(imgCanvasBlockW/2, imgCanvasBlockH);

        imgCanvasBlock.position.set(-imgCanvasBlockW/2, -imgCanvasBlockH/2);
        imgCanvas.addChild(imgCanvasBlock);

        viewport.addChild(imgCanvas);

        const viewportFitX = imgCanvasBlockW + 2 * imgCanvasInitialPadding;
        const viewportFitY = imgCanvasBlockH + 2 * imgCanvasInitialPadding;
        viewport.fit(true, viewportFitX, viewportFitY);
        viewport.moveCenter(imgCanvasBlockW/2, imgCanvasBlockH/2);

        //===== RENDER Blink =====//
        let hasCentered = false;
            media.subscribe(async (media) => {
                const success = renderApp(blink, media, viewport, send);

                // Necessary to fix an occasional race condition with PIXI failing to load
                // Something seems to go wrong due to the canvas having to resize to the window
                window.dispatchEvent(new Event("resize"));

                if (success && !hasCentered) {
                    const viewportFitX = imgCanvasBlockW + 2 * imgCanvasInitialPadding;
                    const viewportFitY = imgCanvasBlockH + 2 * imgCanvasInitialPadding;
                    viewport.fit(true, viewportFitX, viewportFitY);
                    viewport.moveCenter(0, 0);

                    hasCentered = true;
                }
            });

        //===== CENTER VIEWPORT =====//
        // Only do this the very first time we receive valid media

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

    // function exportCanvas() {
    //     const data = blink.renderer.extract.canvas(blink.stage);
    //     console.log(data);
    //     const link = document.createElement("a");
    //     link.download = "export.png";
    //     link.href = data.toDataURL("image/png", 1.0);
    //     link.click();
    //     link.remove();
    // }

</script>

<svelte:window on:keydown={keydown} on:keyup={keyup} />
<div class="{mouseCursor}">
    <!-- <button on:click="{exportCanvas}" >Test</button> -->
    <canvas id="pixiCanvas" bind:this={pixiCanvas} />
</div>

<div class="fullScreen">
    <Debug data={$media} />
    <!-- {JSON.stringify($media, null, 2)} -->
</div>

<style>
    canvas {
        position: absolute;
        margin: 0px;
        padding: 0px;
    }

    button {
        position: absolute;
        z-index: 10;
        top: 10px;
        right: 0px;
        width: 60px;
        height: 30px;
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

    .fullScreen {
        overflow: hidden;
        position: absolute;
        width: 100%;
        height: 100%;
        padding: 0px;
        margin: 0px;

        white-space: break-spaces;
        pointer-events: none;
        z-index: 10;
        font-size: 0.2em;
        color: white;
        height: 100%;
    }
</style>