<script lang="ts">
    import * as PIXI from "pixi.js";
    import { Viewport } from "pixi-viewport";
    import { onDestroy, onMount, tick } from "svelte";
    import { type Writable } from "svelte/store";
    import { renderScene } from "./render";
    import { WindowWithApis, type BlinkCanvas, BlinkCanvasConfig } from "./types";
    import Debug from "./Debug.svelte";
    import { diffCanvasConfig } from "./diff";

    export let media: Writable<BlinkCanvas>;
    export let send: (msg: string, data: any) => void;

    let imgCanvasInitialPadding = 100;
    let canvasConfig: BlinkCanvasConfig = {
        canvasDims: { w: 1920, h: 1080 },
        canvasColor: 0xffffff,
        canvasAlpha: 1,

        exportName: "Blink Export"
    }

    let blink: PIXI.Application;
    let pixiCanvas: HTMLCanvasElement;
    let mouseCursor = "cursorDefault";

    let canvasBlock: PIXI.Graphics;
    let currScene: PIXI.Container;
    let viewport: Viewport;

    onMount(async () => {
    // window.addEventListener("DOMContentLoaded", async () => {
        //====== INITIALIZE PIXI ======//
        blink = new PIXI.Application({
            view: pixiCanvas,
            width: 500,
            height: 500,
            backgroundColor: "#181925",
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
        viewport = new Viewport({
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
        let imgCanvas = new PIXI.Container();
        imgCanvas.name = "imgCanvas";

        function createImageCanvasBlock() {
            const { w: imgCanvasBlockW, h: imgCanvasBlockH } = canvasConfig.canvasDims;

            // canvas
            let imgCanvasBlock = new PIXI.Graphics();
            imgCanvasBlock.beginFill(canvasConfig.canvasColor, canvasConfig.canvasAlpha);
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

            return imgCanvasBlock;
        }

        const imgCanvasBlock = createImageCanvasBlock();
        imgCanvas.addChild(imgCanvasBlock);
        canvasBlock = imgCanvasBlock;

        viewport.addChild(imgCanvas);

        //===== RENDER Blink =====//
        let hasCentered = false;
            media.subscribe(async (media) => {
                //===== UPDATE CANVAS CONFIG =====//
                if (media?.config != null) {
                    const configDiffs = diffCanvasConfig(canvasConfig, media.config);

                    if (configDiffs.size > 0) {
                        canvasConfig = media.config;

                        if (configDiffs.has("canvasBlock")) {
                            imgCanvas.removeChildren();
                            const newImgCanvasBlock = createImageCanvasBlock();
                            imgCanvas.addChild(newImgCanvasBlock);
                            canvasBlock = newImgCanvasBlock;
                        }
                    }
                }

                //===== RENDER SCENE =====//
                const { success, scene } = await renderScene(blink, media, viewport, send);
                currScene = scene;

                // Necessary to fix an occasional race condition with PIXI failing to load
                // Something seems to go wrong due to the canvas having to resize to the window
                window.dispatchEvent(new Event("resize"));

                if (success && !hasCentered) {
                    const viewportFitX = canvasConfig.canvasDims.w + 2 * imgCanvasInitialPadding;
                    const viewportFitY = canvasConfig.canvasDims.h + 2 * imgCanvasInitialPadding;
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

    async function exportImage() {
        if (!currScene || !canvasBlock) return;

        const { w: imgCanvasBlockW, h: imgCanvasBlockH } = canvasConfig.canvasDims;

        const bounds = currScene.getLocalBounds();
        const frame = new PIXI.Rectangle(-bounds.x-imgCanvasBlockW/2, -bounds.y-imgCanvasBlockH/2, imgCanvasBlockW, imgCanvasBlockH);

        const exportCanvas = blink.renderer.extract.canvas(currScene, frame);
        exportCanvas.toBlob((blob) => {
            const metadata = {
                contentType: "image/png",
                name: `${canvasConfig.exportName} ${Math.floor(100000 * Math.random())}`
            };
            (window as WindowWithApis).cache.write(blob, metadata);
        }, "image/png");
        // REMOVED: Exporting straight to local file
        // const link = document.createElement("a");
        // link.download = "export.png";
        // link.href = exportCanvas.toDataURL("image/png", 1.0);
        // link.click();
        // link.remove();
    }
</script>

<svelte:window on:keydown={keydown} on:keyup={keyup} />
<div class="{mouseCursor}">
    <button on:click="{exportImage}">Export</button>
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