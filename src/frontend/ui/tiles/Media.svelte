<!-- This pane is for showing media content large-scale -->
<script lang="ts">
  import Image from "../utils/mediaDisplays/Image.svelte";
  import TextBox from "../utils/mediaDisplays/TextBox.svelte";
  import { mediaStore } from "../../lib/stores/MediaStore";
  import type { GraphNodeUUID, GraphUUID } from "@shared/ui/UIGraph";
  import { writable, type Readable } from "svelte/store";
  import type { MediaOutput } from "@shared/types/media";
  import { onDestroy } from "svelte";
  import ColorDisplay from "../utils/mediaDisplays/ColorDisplay.svelte";
  import SelectionBox from "../utils/graph/SelectionBox.svelte";
  import { type SelectionBoxItem } from "../../types/selection-box";

  const mediaOutputIds = mediaStore.getMediaOutputIdsReactive();

  let selectedItems: SelectionBoxItem[] = [];

  $: if ($mediaOutputIds) {
    selectedItems = Array.from($mediaOutputIds)
      .sort()
      .map((id) => ({ id, title: id }));
  }

  let mediaId = writable("default");
  let oldMediaId: string | null = null;

  const unsubMedia = mediaId.subscribe((newMediaId) => {
    console.log("SUBSCRIBE MEDIA ID", oldMediaId, newMediaId);
    connectNewMedia(oldMediaId, newMediaId);
    oldMediaId = newMediaId;
  });

  let selectedNode: { graphUUID: GraphUUID; outNode: GraphNodeUUID } | null;
  let media: Readable<MediaOutput | null>;

  async function connectNewMedia(oldMediaId: string | null, mediaId: string) {
    if (oldMediaId !== null) {
      console.log("STOPPING OLD", oldMediaId);
      await mediaStore.stopMediaReactive(oldMediaId);
    }
    media = await mediaStore.getMediaReactive(mediaId);
    console.log("CONNECT NEW MEDIA", mediaId, media);
  }

  onDestroy(async () => {
    console.log("ON DESTROY");
    await mediaStore.stopMediaReactive($mediaId);
    unsubMedia();
  });

  // function handleSelect(e: Event) {
  //   return;
  //   const value = (e.target as HTMLSelectElement).value;
  //   if (!value) return;

  //   const [graphUUID, nodeUUID] = value.split("/");
  //   selectedNode = { graphUUID, outNode: nodeUUID };
  // }

  async function exportMedia(e: Event) {
    if ($media?.dataType && $media?.content) {
      await mediaStore.exportMedia($media);
    }
  }

  type MediaDisplay = {
    component: any;
    props: (data: any) => { [key: string]: any };
  };
  const dataTypeToMediaDisplay: { [key: string]: MediaDisplay } = {
    [""]: {
      component: TextBox,
      props: (_data: any) => ({ content: "NO INPUT", status: "warning" }),
    },
    Image: {
      component: Image,
      props: (data: string) => ({ src: data }),
    },
    Number: {
      component: TextBox,
      props: (data: number) => ({
        content: data?.toString() || "NULL",
        status: data == null ? "warning" : "normal",
        fontSize: "large",
      }),
    },
    boolean: {
      component: TextBox,
      props: (data: number) => ({
        content: data?.toString() || "NULL",
        status: data == null ? "warning" : "normal",
        fontSize: "large",
      }),
    },
    string: {
      component: TextBox,
      props: (data: string) => ({ content: data }),
    },
    color: {
      component: ColorDisplay,
      props: (data: string) => ({ color: data }),
    },
    Error: {
      component: TextBox,
      props: (data: string) => ({ content: data, status: "error" }),
    },
  };
</script>

<div class="fullPane">
  <div class="hover flex items-center space-x-2">
    <!-- <input type="text" bind:value="{$mediaId}" class="h-7 bg-zinc-800/80 border border-zinc-600 caret-rose-500 outline-none p-2 rounded-md text-zinc-400" /> -->
    <!-- <select bind:value="{$mediaId}">
      {#if $mediaOutputIds}
        {#each Array.from($mediaOutputIds) as id}
          <option value="{id}">{id}</option>
        {/each}
      {:else}
        <option selected disabled value>No Outputs</option>
      {/if}
    </select> -->
    <div class="self-end">
      <SelectionBox
        items="{selectedItems}"
        bind:selectedItemId="{$mediaId}"
        missingContentLabel="No Outputs"
      />
    </div>
    <div
      on:click="{exportMedia}"
      on:keydown="{null}"
      class="flex h-7 select-none items-center justify-center rounded-md border border-zinc-600 bg-zinc-800/80 p-2 text-zinc-400 hover:bg-zinc-700 active:bg-zinc-800/50"
    >
      Export
    </div>
    <!-- <div class="self-end">
      <SelectionBox
        items="{selectedItems}"
        selectedItemId="{selectedItems[0]?.id}"
        missingContentLabel="No Outputs"
      />
    </div> -->
  </div>

  <div class="media">
    {#if $media}
      {@const display = dataTypeToMediaDisplay[$media.dataType]}
      {#if display}
        <svelte:component this="{display.component}" {...display.props($media.content)} />
      {:else}
        {@const errorDisplay = dataTypeToMediaDisplay["Error"]}
        <svelte:component
          this="{errorDisplay.component}"
          {...errorDisplay.props(`ERROR: Unknown data type: ${JSON.stringify($media)}`)}
        />
      {/if}
      <!-- <Image src="https://media.tenor.com/1wZ88hrB5SwAAAAd/subway-surfer.gif" /> -->
    {:else}
      <div class="placeholder">NO CONTENT</div>
    {/if}
    <!-- <button on:click="{compute}">Testing</button> -->
  </div>
</div>

<style>
  /* Scale the pane to full available space */
  .fullPane {
    margin: 0px;
    width: 100%;
    height: 100%;
  }

  .media {
    position: absolute;
    left: 50%;
    top: 40%;
    transform: translate(-50%, -50%);
    width: 100%;
    margin: auto;
    height: auto;
    text-align: center;
  }

  .hover {
    position: absolute;
    bottom: 1em;
    left: 1em;
    color: black;
    z-index: 100;
  }

  .placeholder {
    padding-top: 140px;
    text-align: center;
    display: inline-block;
    width: 300px;
    height: 300px;
    border: 2px solid grey;
    border-radius: 0.4em;
    margin-top: 1em;
  }
  .placeholder:hover {
    background-color: #1e1e2e;
    cursor: pointer;
  }
</style>
