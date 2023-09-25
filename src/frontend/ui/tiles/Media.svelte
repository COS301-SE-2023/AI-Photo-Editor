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
  import { TweakApi } from "../../lib/webview/TweakApi";
  import { cacheStore } from "../../lib/stores/CacheStore";
  import {
    faBacon,
    faBowlRice,
    faBurger,
    faCandyCane,
    faCarrot,
    faCoffee,
    faCookieBite,
    faFish,
    faHotdog,
    faIceCream,
    faLemon,
    faPizzaSlice,
  } from "@fortawesome/free-solid-svg-icons";
  import Fa from "svelte-fa";
  import { toastStore } from "lib/stores/ToastStore";

  const noContentIcons = [
    faBacon,
    faBowlRice,
    faBurger,
    faCandyCane,
    faCarrot,
    faCoffee,
    faCookieBite,
    faFish,
    faHotdog,
    faIceCream,
    faLemon,
    faPizzaSlice,
  ];

  const mediaOutputIds = mediaStore.getMediaOutputIdsReactive();

  let selectedItems: SelectionBoxItem[] = [];

  $: if ($mediaOutputIds) {
    selectedItems = Array.from($mediaOutputIds)
      .sort()
      .map((id) => ({ id, title: id }));
  }

  let mediaId = writable("");
  let oldMediaId: string | null = null;
  let webview: WebView;

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

  async function exportMedia(e: Event) {
    if (selectedItems.length === 0) {
      toastStore.trigger({ message: "No media selected.", type: "warn" });
      return;
    }

    if ($media?.dataType && $media?.content) {
      if ($media.display.displayType === "webview") {
        webview.exportMedia(e);
      } else {
        await mediaStore.exportMedia($media);
      }
    }
  }

  async function exportCache(e: CustomEvent) {
    const blob = new Blob([await cacheStore.get(e.detail[0].cacheUUID)], {
      type: $cacheStore[e.detail[0].cacheUUID].contentType,
    });
    const link = document.createElement("a");
    link.download = $cacheStore[e.detail[0].cacheUUID].name ?? "export.png";
    link.href = URL.createObjectURL(blob);
    link.click();
    link.remove();

    // console.log(await cacheStore.get(e.detail.cacheUUID));
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

  function getNoContentIcon() {
    return noContentIcons[Math.floor(Math.random() * noContentIcons.length)];
  }

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
      Save Asset
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
      {#if $media.display.displayType === "webview"}
        <svelte:component
          this="{displayIdToSvelteConstructor[$media.display.displayType]}"
          bind:this="{webview}"
          {...getDisplayProps($media)}
        />
      {:else}
        <svelte:component
          this="{displayIdToSvelteConstructor[$media.display.displayType]}"
          {...getDisplayProps($media)}
        />
      {/if}
      <!-- <TextBox
          content="ERROR: Unknown data type: ${JSON.stringify($media)}"
          status="error"
        /> -->
      <!-- <Image src="https://media.tenor.com/1wZ88hrB5SwAAAAd/subway-surfer.gif" /> -->
    {:else}
      <div class="placeholder">
        <div class="icon"><Fa icon="{getNoContentIcon()}" style="display: inline-block" /></div>
        <h1>No content!</h1>
        <h2>Add an Output node to the graph to create a media output</h2>
      </div>
    {/if}
    <!-- <button on:click="{compute}">Testing</button> -->
  </div>
</div>

<style lang="scss">
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
    width: 100%;
    height: 100%;
    margin-top: 1em;

    h1 {
      font-size: 1.5em;
      color: #a8a8be;
      margin-bottom: 0.2em;
    }

    .icon {
      width: 100%;
      color: #9090a4;
      font-size: 5em;
      line-height: 1em;
      margin-bottom: 0.1em;
    }

    h2 {
      font-size: 0.8em;
      color: #9090a4;
    }
  }
</style>
