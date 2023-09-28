<script>
    import { onDestroy, onMount } from "svelte";

    export let media;

    const MAX_EDITING_RES = 1024;

    let canvasContainer;
    let canvasWidth = 500;
    let canvasHeight = 500;
    const canvas = fx.canvas();
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.objectFit = "contain";
    let lastid = "";
    let lastMediaSrc = "";

    let image;
    let texture;


    const send = (message, data) => {
    	window.api.send(message, data);
    }

    async function updateImage(uuid) {
        return new Promise(async (resolve, reject) => {
            const src = URL.createObjectURL(await window.cache.get(uuid));
            image = new Image();
            image.onload = () => {resolve(); URL.revokeObjectURL(src);}
            image.onerror = () => reject();
            image.src = src;
        });
    }

    function reloadTexture() {
        texture = canvas.texture(image);
    }

    // Clamp image dimensions to maxRes
    // Set maxRes to null to disable clamping
    function clampedImageRes(image, maxRes) {
        if (maxRes != null && image.width > maxRes && image.height > maxRes) {
            const dimRatio = image.height / image.width;
            return { w: maxRes, h: maxRes * dimRatio };
        }
        return { w: image.width, h: image.height };
    }

    $: redraw($media, MAX_EDITING_RES);

    async function redraw(media, maxRes) {
        if(!media.src){
            // image = null;
            // texture = null;
            // canvas.draw(texture).update();
            var gl = canvas.getContext("webgl");

            // Clear the canvas to a specified color
            // gl.clearColor(0.0, 0.0, 0.0, 1.0); // This sets the clear color to black
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            return;
        }
        if (media?.ops && canvas && texture) {
            if (media.src != lastMediaSrc) {
                await updateImage(media.src);
                lastMediaSrc = media.src;
                reloadTexture();
            }

            const { w, h } = clampedImageRes(image, maxRes);
            let buffer = canvas.draw(texture, w, h);

            for (let op = 0; op < media.ops.length; op++) {
                console.log(media.ops[op]);
                const opType = media.ops[op].type;
                const opArgs = media.ops[op].args;

                buffer = buffer[opType](...opArgs);
            }

            buffer.update();
        }
        else{
            if(media.src){
                await updateImage(media.src);
                lastMediaSrc = media.src;
                reloadTexture();

                const { w, h } = clampedImageRes(image, maxRes);
                let buffer = canvas.draw(texture, w, h);
                buffer.update();

            }
        }
        // To obtain previous render + reuse:
        // texture.destroy();
        // texture = canvas.contents();
        // canvas.draw(texture).update();
    }

    function exportImage(){
        // TODO: Redraw at full res, then reset to editing res after export
        // redraw($media, null);

        canvas.update();
        canvas.toBlob(async (blob) => {
            const metadata = {
                contentType: "image/png",
                name: `GLFX Export ${Math.floor(100000 * Math.random())}`
            };
            send("exportResponse", {cacheUUID: await window.cache.write(blob, metadata)});
        }, "image/png");
    }

    onMount(async () => {
        canvasContainer.appendChild(canvas);

	    window.api.on("export", async () => {
              exportImage();
	    	// send("exportResponse", "exported");
	    })
    });

    onDestroy(() => {
        if(texture) {
            texture.destroy();
        }
    });
</script>

<div class="fullScreen">
    <div
        class="canvasContainer"
        bind:this={canvasContainer}
    />
</div>

<!-- <code>
    Rendering at: <b>{canvasWidth} x {canvasHeight}</b><br />
    Media: {JSON.stringify($media)}
</code> -->

<style>
    .fullScreen {
        position: absolute;
        top: 0px;
        left: 0px;
        right: 0px;
        bottom: 0px;
        padding: 0px;
        margin: 0px;
    }

    .canvasContainer {
        display: flex;
        flex-direction: column;
        justify-content: center;

        padding: 0px;
        margin: 2em 1em 3em;

        overflow: hidden;

        height: calc(100% - 8em);
    }

    code { 
        color: white;
    }
</style>