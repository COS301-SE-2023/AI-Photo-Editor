<!-- This pane is for showing media content large-scale -->
<script lang="ts">
  import Image from "../../ui/utils/Image.svelte";
  import TextBox from "../../ui/utils/TextBox.svelte";
  import { mediaStore } from "../../lib/stores/MediaStore";
  import type { GraphNode, GraphNodeUUID, GraphUUID } from "@shared/ui/UIGraph";
  import { graphMall } from "lib/stores/GraphStore";
  import { get, writable, type Readable } from "svelte/store";
  import type { MediaOutput } from "@shared/types/media";
  import { onDestroy } from "svelte";

  const graphUUIDs = graphMall.getAllGraphUUIDsReactive();

  $: outputNodesByGraphUUID = getAllOutputNodesByGraphUUID($graphUUIDs);
  type NodesByUUID = Readable<{ [key: GraphNodeUUID]: GraphNode }>;

  function getAllOutputNodesByGraphUUID(graphUUIDs: GraphUUID[]): {
    [key: GraphUUID]: NodesByUUID;
  } {
    let res: { [key: GraphUUID]: NodesByUUID } = {};

    for (let uuid of graphUUIDs) {
      res[uuid] = graphMall.getGraph(uuid)?.getOutputNodesByIdReactive();
    }

    return res;
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

  function handleSelect(e: Event) {
    return;
    const value = (e.target as HTMLSelectElement).value;
    if (!value) return;

    const [graphUUID, nodeUUID] = value.split("/");
    selectedNode = { graphUUID, outNode: nodeUUID };
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
        status: !!data ? "normal" : "warning",
      }),
    },
    string: {
      component: TextBox,
      props: (data: string) => ({ content: data }),
    },
    Error: {
      component: TextBox,
      props: (data: string) => ({ content: data, status: "error" }),
    },
  };
</script>

<div class="fullPane">
  <div class="hover">
    <input type="text" bind:value="{$mediaId}" />
    <select on:change="{handleSelect}">
      <option selected disabled value> --- </option>
      {#each Object.keys(outputNodesByGraphUUID) as graphUUID}
        {@const outputNodes = get(outputNodesByGraphUUID[graphUUID])}
        <option value="{graphUUID}" disabled>
          --- {graphUUID.slice(0, 6)} ---
        </option>

        {#each Object.keys(outputNodes) as outputId}
          {@const output = outputNodes[outputId]}
          <option value="{graphUUID}/{output.uuid}">
            {output.uuid.slice(0, 6)}
          </option>
        {/each}
      {/each}
    </select>
  </div>

  <div class="media">
    {#if $media}
      <svelte:component
        this="{dataTypeToMediaDisplay[$media.dataType].component}"
        {...dataTypeToMediaDisplay[$media.dataType].props($media.content)}
      />
      <!-- <Image src="https://media.tenor.com/1wZ88hrB5SwAAAAd/subway-surfer.gif" /> -->
    {:else}
      <div class="placeholder">NULL</div>
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
    width: calc(100%-2em);
    margin: auto;
    height: auto;
    text-align: center;
  }

  .hover {
    position: absolute;
    bottom: 1em;
    left: 1em;
    color: black;
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
