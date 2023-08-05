<script>
    import { onDestroy, onMount } from "svelte";

    export let media;

    let canvasContainer;
    let canvasWidth = 500;
    let canvasHeight = 500;
    let canvasRect;
    const canvas = fx.canvas();

    let image;
    let texture;

    $: canvasUpdate(canvasWidth);

    function canvasUpdate(canvasWidth) {
        image = new Image();

        // image.src = "file:///home/rec1dite/code/301/capstone/blix-plugins/glfx-plugin/src/image.png";
        image.src = "./image.png";

        const dimRatio = image.height / image.width;

        image.width = canvasWidth;
        image.height = canvasWidth * dimRatio;

        image.onload = () => {
            texture = canvas.texture(image);
            redraw();
        }
    }


    $: redraw($media);

    function redraw(media) {
        if (media && canvas && texture) {
            let res = canvas.draw(texture);

            for (let op = 0; op < media.ops.length; op++) {
                console.log(media.ops[op]);
                const opType = media.ops[op].type;
                const opArgs = media.ops[op].args;

                res = res[opType](...opArgs);
            }
            // .swirl(canvas.width / 2, canvas.height / 2, 400, -10*media)

            res.update();
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

<code>
    Rendering at: <b>{canvasWidth} x {canvasHeight}</b><br />
    Media: {JSON.stringify($media)}
</code>

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