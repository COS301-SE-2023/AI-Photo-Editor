<script>
    import { onDestroy, onMount } from "svelte";

    export let media;

    let canvasContainer;
    let canvasWidth = 500;
    let canvasHeight = 500;
    const canvas = fx.canvas();
    let lastid = "";

    let image;
    let texture;

    async function updateImage(src) {
        return new Promise((resolve, reject) => {
            image = new Image();
            image.onload = () => resolve();
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
        if (media?.ops && canvas && texture) {
            if (media.src) {
                // if (media.src === "") {
                //     image = null;
                //     texture = null;
                //     canvas.draw(texture).update();
                //     return;
                // }
                await updateImage(media.src);
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
                console.log("here");
                await updateImage(media.src);
                reloadTexture();
                redraw(media);
            }
        }

        // To obtain previous render + reuse:
        // texture.destroy();
        // texture = canvas.contents();
        // canvas.draw(texture).update();
    }

    onMount(async () => {
        canvasContainer.appendChild(canvas);
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
    }

    code { 
        color: white;
    }
</style>