<!-- The canvas which displays our beautiful Svelvet GUI graph -->
<script lang="ts">
  import { Svelvet, type NodeKey, type AnchorKey } from "blix_svelvet";
  import { type Readable } from "svelte/store";
  import { GraphStore, graphMall } from "lib/stores/GraphStore";
  import PluginNode from "../utils/graph/PluginNode.svelte";
  import type { UUID } from "@shared/utils/UniqueEntity";
  import type { GraphEdge, GraphNode } from "@shared/ui/UIGraph";
  // import { type Anchor } from "blix_svelvet/dist/types"; // TODO: Use to createEdge

  // TODO: Abstract panelId to use a generic UUID
  // export let panelId = 0;
  export let panelId = Math.round(10000000.0 * Math.random()).toString();

  let graphIds = graphMall.getAllGraphUUIDsReactive();
  let graphId = $graphIds[0];

  let thisGraphStore: Readable<GraphStore | null>;
  let graphNodes: Readable<GraphNode[]>;
  let graphEdges: Readable<GraphEdge[]>;

  let graphData: any;

  // Svelvet graph data
  $: translation = graphData?.transforms?.translation;
  $: zoom = graphData?.transforms?.scale;
  $: dimensions = graphData?.dimensions;

  // Hooks exposed by <Svelvet />
  let connectAnchorIds: (
    sourceNode: NodeKey,
    sourceAnchor: AnchorKey,
    targetNode: NodeKey,
    targetAnchor: AnchorKey
  ) => boolean;
  let clearAllGraphEdges: () => void;

  // Swap out the graph when the user makes a selection in the dropdown
  function updateOnGraphId(graphId: string) {
    thisGraphStore = graphMall.getGraphReactive(graphId);
    if ($thisGraphStore) {
      graphNodes = $thisGraphStore.getNodesReactive();
      graphEdges = $thisGraphStore.getEdgesReactive();
    }
  }

  function updateOnGraphEdges(graphEdges: GraphEdge[]) {
    if (clearAllGraphEdges) clearAllGraphEdges();

    for (let edge in graphEdges) {
      console.log("EDGE", edge, graphEdges[edge]);
      if (!graphEdges.hasOwnProperty(edge)) continue;
      const edgeData = graphEdges[edge];

      // Skip if nodes don't exist
      // const fromNode = $graphNodes.find(node => node.id === edgeData.nodeFrom)
      // const toNode   = $graphNodes.find(node => node.id === edgeData.nodeTo);
      // if (!fromNode || !toNode) continue;

      if (connectAnchorIds) {
        const res = connectAnchorIds(
          `N-${panelId}_${edgeData.nodeUUIDFrom}`,
          // E.g. A-4_in2/N-4_IxExhIof-npSfn0dnO-VRSW4_kqn2z5bcCPCcflY_MA
          `A-${panelId}_${edgeData.anchorIdFrom}`,
          `N-${panelId}_${edgeData.nodeUUIDTo}`,
          `A-${panelId}_${edgeData.anchorIdTo}`
        );
      }
    }
  }

  $: updateOnGraphEdges($graphEdges);

  // Only updates when _graphId_ changes
  $: updateOnGraphId(graphId);

  function addNode() {
    $thisGraphStore?.addNode("hello-plugin.hello", getGraphCenter());
    // $thisGraphStore?.addNode();
  }

  function getGraphCenter() {
    return {
      x: $dimensions.width / 2 - $translation.x / $zoom,
      y: $dimensions.height / 2 - $translation.y / $zoom,
    };
  }

  // Svelvet id's are of the following format:
  // <panelId>_<anchorId>/<panelId>_<nodeUUID>
  // Entities include nodes and anchors
  function splitCompositeAnchorId(entityId: string): { anchorUUID: UUID; nodeUUID: UUID } | null {
    if (!$thisGraphStore) return null;
    try {
      const [anchorKey, nodeKye] = entityId.split("/");

      const [_1, anchorId] = anchorKey.split("_");
      const [_2, ...nodeUUIDParts] = nodeKye.split("_");
      const nodeUUID = nodeUUIDParts.join("_");

      // removing console logs + commit + merge <=====================================
      // console.log("NODE", $thisGraphStore.getNode(nodeUUID));
      const anchorUUID = $thisGraphStore.getNode(nodeUUID).anchorUUIDs[anchorId];

      if (!anchorUUID || !nodeUUID) return null;
      return { anchorUUID, nodeUUID };
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  function edgeConnected(e: CustomEvent<any>) {
    console.log("CONNECTION EVENT");
    const fromAnchor = splitCompositeAnchorId(e.detail.sourceAnchor.id);
    const toAnchor = splitCompositeAnchorId(e.detail.targetAnchor.id);

    if (!fromAnchor || !toAnchor) return;
    $thisGraphStore?.addEdge(fromAnchor.anchorUUID, toAnchor.anchorUUID);
  }

  function edgeDisconnected(e: CustomEvent<any>) {
    console.log("DISCONNECTION EVENT");
    const toUUID = splitCompositeAnchorId(e.detail.targetAnchor.id);

    if (!toUUID) return;
    $thisGraphStore?.removeEdge(toUUID.anchorUUID);
  }
</script>

<div class="hoverElements">
  <button on:click="{addNode}">Add Node</button>
  <select name="graphPicker" class="dropdown" bind:value="{graphId}">
    {#each $graphIds as id}
      <option value="{id}">{id.slice(0, 8)}</option>
    {/each}
  </select>
  <!-- <button style:float="right" on:click={addRandomConn}>Add random conn</button> -->
  <!-- <button style:float="right" on:click={clearEdges}>Clear edges</button> -->
</div>

{#if thisGraphStore}
  <Svelvet
    id="{panelId}-{graphId}"
    zoom="{0.7}"
    minimap
    theme="custom-dark"
    bind:graph="{graphData}"
    on:connection="{edgeConnected}"
    on:disconnection="{edgeDisconnected}"
    bind:connectAnchorIds="{connectAnchorIds}"
    bind:clearAllGraphEdges="{clearAllGraphEdges}"
  >
    {#each $graphNodes || [] as node}
      {#key node.uuid}
        <PluginNode panelId="{panelId}" graphId="{graphId}" node="{node}" />
      {/key}
    {/each}

    <!-- Testing graph center -->
    <!-- <Node position="{$translation && getGraphCenter()}">
      <div class="z-50 text-white">
        {JSON.stringify($translation)}<br />
        {JSON.stringify($zoom)}
      </div>
    </Node> -->
  </Svelvet>
{:else}
  <div>Graph store not found</div>
{/if}

<style>
  :root[svelvet-theme="custom-dark"] {
    --background-color: #181825;
    --dot-color: hsl(225, 10%, 50%);

    --minimap-background-color: #52525b;

    --minimap-node-color: hsl(225, 30%, 20%);

    --controls-background-color: hsl(225, 20%, 27%);
    --controls-text-color: hsl(0, 0%, 100%);

    --theme-toggle-text-color: hsl(0, 0%, 100%);
    --theme-toggle-color: hsl(225, 20%, 27%);
  }

  .hoverElements {
    position: absolute;
    bottom: 10px;
    left: 10px;
    z-index: 100;
  }

  .dropdown {
    color: #11111b;
  }
</style>
