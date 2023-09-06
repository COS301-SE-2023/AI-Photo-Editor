<script lang="ts">
    import * as PIXI from "pixi.js";
    import { onDestroy, onMount } from "svelte";

    export let media: any;

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

        //===== CREATE BASE LAYOUT =====//
        let imgCanvas = new PIXI.Container();

        const imgCanvasBlockSize = 200;
        let imgCanvasBlock = new PIXI.Graphics();
        imgCanvasBlock.beginFill(0xffffff, 0.9);
        imgCanvasBlock.drawRect(-imgCanvasBlockSize/2, -imgCanvasBlockSize/2, imgCanvasBlockSize, imgCanvasBlockSize);

        imgCanvas.addChild(imgCanvasBlock);
        pixi.stage.addChild(imgCanvas);

        // Center the stage on screen
        pixi.stage.transform.position.x = pixi.screen.width / 2;
        pixi.stage.transform.position.y = pixi.screen.height / 2;
        pixi.stage.transform.scale.set(4);

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

            var filter = new PIXI.BlurFilter(10, 10);
            filter.resolution = sprite.scale.x;
            sprite.filters = [filter];

            // Create interaction box once sprite has loaded

            const box = new PIXI.Graphics();
            box.lineStyle(1, 0xf43e5c, 0.5);
            box.drawRect(0, 0, sprite.width, sprite.height);
            box.zIndex = 1000;

            spriteContainer.addChild(sprite);
            // spriteContainer.addChild(box);
            // box.sortChildren();

            imgCanvas.addChild(spriteContainer);
        }

        //===== MAIN LOOP =====//
        let elapsed = 0;
        pixi.ticker.add((delta) => {
            elapsed += delta;

            filter.resolution = 1.0/imgCanvas.scale.x;

            // imgCanvas.angle = 100*Math.cos(elapsed/10);
        });
    });


    //===== PANNING CONTROLS =====//
    const scaleSpeed = 0.1;
    let spacePressed = false;

    function onMouseDown(e: MouseEvent) {
        if ((e.button == 0 && spacePressed) || e.button == 1) {
            mouseCursor = "cursorGrabbing";
        }
    }
    function onMouseUp(e: MouseEvent) {
        if (e.button == 1) {
            mouseCursor = "cursorDefault";
        }
    }
    function onWheel(e: WheelEvent) {
        let s = pixi.stage.scale.x, tx = (e.x - pixi.stage.x) / s, ty = (e.y - pixi.stage.y) / s;
        s += -1 * Math.max(-1, Math.min(1, e.deltaY)) * scaleSpeed * s;
        pixi.stage.setTransform(-tx * s + e.x, -ty * s + e.y, s, s);
    }

    function onKeyDown(e: KeyboardEvent) {
        if (e.key == " ") {
            spacePressed = true;
            mouseCursor = "cursorGrab";
        }
    }
    function onKeyUp(e: KeyboardEvent) {
        if (e.key == " ") {
            spacePressed = false;
            // mouseCursor = "cursorDefault";
        }
    }
    function onMouseMove(e: MouseEvent) {
        // Space + Left Click / Middle Click
        if (e.buttons == 1 && spacePressed || e.buttons == 4) {
            pixi.stage.x += e.movementX;
            pixi.stage.y += e.movementY;
        }
    }
    onDestroy(() => {
    });
</script>

<div class="{mouseCursor}">
    <canvas id="pixiCanvas" bind:this={pixiCanvas} />
</div>
<svelte:window
    on:mousemove="{onMouseMove}"
    on:mousedown="{onMouseDown}"
    on:mouseup="{onMouseUp}"
    on:mousewheel="{onWheel}"

    on:keydown="{onKeyDown}"
    on:keyup="{onKeyUp}"
/>

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
        text-align: right;
        top: 0px;
        right: 0px;
        font-size: 1.2em;
        z-index: 10;
        color: white;
    }
</style>