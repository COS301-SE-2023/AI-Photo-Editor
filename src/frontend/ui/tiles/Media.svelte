<!-- This pane is for showing media content large-scale -->
<script lang="ts">
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
  import { MediaDisplayType, type DisplayableMediaOutput } from "@shared/types/media";
  import { onDestroy } from "svelte";
  import Fa from "svelte-fa";
  import { derived, writable, type Readable } from "svelte/store";
  import { mediaStore } from "../../lib/stores/MediaStore";
  import { projectsStore } from "../../lib/stores/ProjectStore";
  import { toastStore } from "../../lib/stores/ToastStore";
  import { TweakApi } from "../../lib/webview/TweakApi";
  import { type SelectionBoxItem } from "../../types/selection-box";
  import SelectionBox from "../utils/graph/SelectionBox.svelte";
  import ColorDisplay from "../utils/mediaDisplays/ColorDisplay.svelte";
  import Image from "../utils/mediaDisplays/Image.svelte";
  import TextBox from "../utils/mediaDisplays/TextBox.svelte";
  import WebView from "./WebView.svelte";

  export let projectId: string;

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
  let selectedItems: SelectionBoxItem[] = [];
  let selectedItemId = "";
  let selectedMediaId = writable("");
  let oldMediaId: string | null = null;
  let webview: WebView;
  let media: Readable<DisplayableMediaOutput | null>;

  const mediaOutputList = mediaStore.getMediaOutputListReactive();

  console.log("Media pane", projectId);

  const mediaOutputs = derived(
    [projectsStore, mediaOutputList],
    ([$projectsStore, $mediaOutputList]) => {
      const project = $projectsStore.projects.find((p) => p.id === projectId);

      // console.log(projectId.slice(0, 6), $mediaOutputList);

      if (!project) {
        return [];
      }

      const mediaList = $mediaOutputList.filter((media) =>
        project.mediaOutputIds.includes(media.nodeId)
      );

      return mediaList;
    }
  );

  mediaOutputs.subscribe((state) => {
    selectedItems = state.map((media) => ({
      id: media.nodeId,
      title: media.mediaId,
    }));
    // console.log(projectId.slice(0, 6), selectedItems);
  });

  $: selectedMediaId.set(selectedItems.find((item) => item.id === selectedItemId)?.title ?? "");

  // $: if ($mediaOutputIds) {
  //   selectedItems = Array.from($mediaOutputIds)
  //     .sort()
  //     .map((id) => ({ id, title: id }));
  // }

  // Changes output on output node click
  // $: if ($nodeIdLastClicked) {
  //   const mediaOutputId = mediaStore.getMediaOutputId($nodeIdLastClicked);
  //   if (mediaOutputId) {
  //     selectedMediaId.set(mediaOutputId);
  //   }
  // }

  const unsubMedia = selectedMediaId.subscribe((newMediaId) => {
    connectNewMedia(oldMediaId, newMediaId);
    oldMediaId = newMediaId;
  });

  async function connectNewMedia(oldMediaId: string | null, mediaId: string) {
    if (oldMediaId !== null) {
      await mediaStore.stopMediaReactive(oldMediaId);
    }
    if (mediaId) {
      media = await mediaStore.getMediaReactive(mediaId);
    } else {
      media = writable(null);
    }
  }

  onDestroy(async () => {
    await mediaStore.stopMediaReactive($selectedMediaId);
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
        // await mediaStore.exportMedia($media);
        toastStore.trigger({ message: "Unsupported media type for saving.", type: "info" });
      }
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
    <!-- <input type="text" bind:value="{$mediaId}" class="h-7 bg-zinc-800/80 border border-zinc-600 caret-primary-500 outline-none p-2 rounded-md text-zinc-400" /> -->
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
        bind:selectedItemId="{selectedItemId}"
        missingContentLabel="No Media"
      />
    </div>
    <div
      on:click="{exportMedia}"
      on:keydown="{null}"
      class="flex h-7 min-w-max select-none items-center justify-center rounded-md border border-zinc-600 bg-zinc-800/80 p-2 text-zinc-400 hover:bg-zinc-700 active:bg-zinc-800/50"
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
      <div class="placeholder select-none">
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
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

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
