<script>
    import { Canvas, T } from "@threlte/core";
    import Scene from "./Scene.svelte";

    export let media;

    // $: redraw($media);

    // function redraw(media) {
    //     if (media) {}
    // }

</script>

<div class="container">
    <Canvas>
        <Scene />
    </Canvas>
</div>

<code>
    Media: {JSON.stringify($media)}
</code>

<style>
    .container {
        position: absolute;
        margin: 0px;
        padding: 0px;
        width: 100%;
        height: 100%;
        /* border: 1px solid blue; */
    }

    code { 
        color: white;
    }
</style>