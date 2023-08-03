<script>
    const message = "Hello world from Svelte!";
    export let greeting = "";
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