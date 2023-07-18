<script lang="ts">
  import Toast from "./Toast.svelte";
  import { toastStore } from "../../../lib/stores/ToastStore";
  import { fade } from "svelte/transition";
  import { flip } from "svelte/animate";

  let hoveredId: string | null = null;
  const maxToasts = 5;

  function onMouseEnter(id: string) {
    toastStore.freeze(id);
    hoveredId = id;
  }

  function onMouseLeave(id: string) {
    toastStore.unfreeze(id);
    hoveredId = null;
  }
</script>

{#if $toastStore}
  <section class="fixed bottom-5 right-5 z-[10000] w-96 space-y-3">
    {#each $toastStore.slice(0, maxToasts) as toast (toast.id)}
      <div
        animate:flip="{{ duration: 250 }}"
        in:fade
        out:fade
        on:mouseenter="{() => onMouseEnter(toast.id)}"
        on:mouseleave="{() => onMouseLeave(toast.id)}"
      >
        <Toast
          {...toast}
          hovered="{hoveredId === toast.id}"
          on:dismiss="{() => toastStore.dismiss(toast.id)}"
        />
      </div>
    {/each}
  </section>
{/if}
