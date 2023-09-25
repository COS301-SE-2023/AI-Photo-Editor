<script>
    import { onDestroy, onMount } from "svelte";

    export let media;

    let canvasContainer;
    let canvasWidth = 500;
    let canvasHeight = 500;
    const canvas = fx.canvas();
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
        // const dimRatio = image.height / image.width;
        // image.width = canvasWidth;
        // image.height = canvasWidth * dimRatio;

        texture = canvas.texture(image);
    }

    async function canvasUpdate(canvasWidth) {
        // await updateImage("./image.png");
        if(Object.keys($media).length === 0) {
            return;
        }
        reloadTexture();
        redraw($media);
    }

    $: redraw($media);
    $: canvasUpdate(canvasWidth);

    async function redraw(media) {
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

            const dimRatio = image.height / image.width;
            let buffer = canvas.draw(texture, canvasWidth, canvasWidth*dimRatio);

            for (let op = 0; op < media.ops.length; op++) {
                console.log(media.ops[op]);
                const opType = media.ops[op].type;
                const opArgs = media.ops[op].args;

                buffer = buffer[opType](...opArgs);
            }
            // .swirl(canvas.width / 2, canvas.height / 2, 400, -10*media)

            buffer.update();
        }
        else{
            if(media.src){
                await updateImage(media.src);
                lastMediaSrc = media.src;
                reloadTexture();
                const dimRatio = image.height / image.width;
                let buffer = canvas.draw(texture, canvasWidth, canvasWidth*dimRatio);
                buffer.update();
            }
        }

        // To obtain previous render + reuse:
        // texture.destroy();
        // texture = canvas.contents();
        // canvas.draw(texture).update();
    }

    function exportImage(){
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

<div
    class="canvasContainer"
    bind:this={canvasContainer}
    bind:clientWidth="{canvasWidth}"
/>

<!-- <code>
    Rendering at: <b>{canvasWidth} x {canvasHeight}</b><br />
    Media: {JSON.stringify($media)}
</code> -->

<style>
    .canvasContainer {
        padding: 0px;
        margin: 4em;
        text-align: center;
        overflow: none;
    }

    code { 
        color: white;
    }
</style>