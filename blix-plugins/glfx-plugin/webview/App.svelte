<script>
    import { onMount } from "svelte";

    const message = "Hello world from Svelte!";
    export let greeting = "";

    onMount(() => {
    });
</script>

<h1>
    {message}<br />
    {greeting}
</h1>

<style>
    h1 {
        color: white;
    }
</style>