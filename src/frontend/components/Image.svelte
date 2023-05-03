{#if loadState == "loaded"}
	<img {src} alt="Document" />
{:else if loadState == "failed"}
	<img src="" alt="Not Found" />
{:else if loadState == "loading"}
	<img src="" alt="Loading..." />
{/if}

<script lang="ts">
	import { onMount } from 'svelte'
	export let src: string;

    let loadState = 'loaded';

	onMount(() => {
			const img = new Image();
			img.src = src;
            loadState = "loading";

			img.onload = () => { loadState = "loaded"; };
			img.onerror = () => { loadState = "failed"; };
	})
</script>
