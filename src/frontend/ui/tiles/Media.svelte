<!-- This pane is for showing media content large-scale -->
<script lang="ts">
  import Image from "../utils/mediaDisplays/Image.svelte";
  import TextBox from "../utils/mediaDisplays/TextBox.svelte";
  import { mediaStore } from "../../lib/stores/MediaStore";
  import type { GraphNodeUUID, GraphUUID } from "@shared/ui/UIGraph";
  import { writable, type Readable } from "svelte/store";
  import { MediaDisplayType, type DisplayableMediaOutput } from "@shared/types/media";
  import { onDestroy } from "svelte";
  import ColorDisplay from "../utils/mediaDisplays/ColorDisplay.svelte";
  import SelectionBox from "../utils/graph/SelectionBox.svelte";
  import { type SelectionBoxItem } from "../../types/selection-box";
  import WebView from "./WebView.svelte";
  import { TweakApi } from "lib/webview/TweakApi";

  const mediaOutputIds = mediaStore.getMediaOutputIdsReactive();

  let selectedItems: SelectionBoxItem[] = [];

  $: if ($mediaOutputIds) {
    selectedItems = Array.from($mediaOutputIds)
      .sort()
      .map((id) => ({ id, title: id }));
  }

  let mediaId = writable("");
  let oldMediaId: string | null = null;

  const unsubMedia = mediaId.subscribe((newMediaId) => {
    // console.log("SUBSCRIBE MEDIA ID", oldMediaId, newMediaId);
    connectNewMedia(oldMediaId, newMediaId);
    oldMediaId = newMediaId;
  });

  // TODO: Add toggle that auto-switches media to the last selected output node
  let selectedNode: { graphUUID: GraphUUID; outNode: GraphNodeUUID } | null;
  let media: Readable<DisplayableMediaOutput | null>;

  async function connectNewMedia(oldMediaId: string | null, mediaId: string) {
    if (oldMediaId !== null) {
      // console.log("STOPPING OLD", oldMediaId);
      await mediaStore.stopMediaReactive(oldMediaId);
    }
    media = await mediaStore.getMediaReactive(mediaId);
    // console.log("CONNECT NEW MEDIA", mediaId, media);
  }

  onDestroy(async () => {
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

  function getDisplayProps(media: DisplayableMediaOutput) {
    let res = media.display.props;
    if (media.display.contentProp !== null) res[media.display.contentProp] ??= media.content; // If content nullish, use default value
    if (media.display.displayType === MediaDisplayType.Webview) {
      // Provide Tweak API access
      res["tweakApi"] = new TweakApi(media.graphUUID);
    }
    return res;
  }

  // async function getDisplay(id: TypeclassId) {
  //   const value = null;
  //   return await window.apis.typeclassApi.getMediaDisplay(id, value);
  // }

  // type MediaDisplay = {
  //   component: any;
  //   props: (data: any) => { [key: string]: any };
  // };
  // const dataTypeToMediaDisplay: { [key: string]: MediaDisplay } = {
  //   [""]: { component: TextBox, props: (_data: any) => ({ content: "NO INPUT", status: "warning" }), },
  //   Image: { component: Image, props: (data: string) => ({ src: data }), },
  //   Number: { component: TextBox, props: (data: number) => ({ content: data?.toString() || "NULL", status: data == null ? "warning" : "normal", fontSize: "large", }),
  //   }, boolean: { component: TextBox, props: (data: number) => ({ content: data?.toString() || "NULL", status: data == null ? "warning" : "normal", fontSize: "large", }), },
  //   string: { component: TextBox, props: (data: string) => ({ content: data }), },
  //   color: { component: ColorDisplay, props: (data: string) => ({ color: data }), },
  //   Error: { component: TextBox, props: (data: string) => ({ content: data, status: "error" }), },
  //   ["GLFX image"]: { component: WebView, props: (data: string) => ({ media: data }), },
  //   ["Pixi image"]: { component: WebView, props: (data: string) => ({ media: data }), },
  // };

  const displayIdToSvelteConstructor: { [key in MediaDisplayType]: any } = {
    image: Image,
    textbox: TextBox,
    colorDisplay: ColorDisplay,
    webview: WebView,
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
      <svelte:component
        this="{displayIdToSvelteConstructor[$media.display.displayType]}"
        {...getDisplayProps($media)}
      />
      <!-- <TextBox
          content="ERROR: Unknown data type: ${JSON.stringify($media)}"
          status="error"
        /> -->
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
    width: 100%;
    height: 100%;
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
