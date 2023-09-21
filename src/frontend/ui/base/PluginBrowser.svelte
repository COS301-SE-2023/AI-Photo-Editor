<script lang="ts">
  import Shortcuts from "../utils/Shortcuts.svelte";
  import Markdown from "./Markdown.svelte";

  let selectedPlugin: string | null = null;

  type PluginData = {
    name: string;
    md: string;
  };

  const plugins: { [key: string]: PluginData } = {
    "hello-plugin": {
      name: "Hello Plugin",
      md: "# Hello plugin\n\n> This is a plugin with basic dev testing nodes",
    },
    "glfx-plugin": {
      name: "GLFX Plugin",
      md: "# GLFX Plugin\n\nThis is a plugin that uses the GLFX library to apply effects to images",
    },
    blink: {
      name: "Blink",
      md: "# Blink\n\n> A feature-rich plugin for non-destructive image editing",
    },
  };

  const shortcuts = {
    "blix.pluginBrowser.deselectPlugin": () => {
      selectedPlugin = null;
    },
  };
</script>

<div class="container">
  <div class="sidebar">
    <!-- Search box -->
    <input type="text" class="searchBox" />
    <div class="pluginList">
      {#each Object.keys(plugins) as pluginId}
        {@const plugin = plugins[pluginId]}
        <div
          class="pluginItem"
          on:click|stopPropagation="{() => (selectedPlugin = pluginId)}"
          on:keypress
        >
          <div class="title">{plugin.name}</div>
          <div class="id">{pluginId}</div>
        </div>
        <hr />
      {/each}
    </div>
  </div>
  <div class="pluginPage">
    {#if selectedPlugin != null}
      {@const plugin = plugins[selectedPlugin]}
      <div class="banner">
        <div class="title">{plugin.name}</div>
        <div class="id">{selectedPlugin}</div>
      </div>
      <div class="readmeBox">
        <Markdown markdown="{plugin.md}" />
      </div>
    {/if}
  </div>
</div>

<Shortcuts shortcuts="{shortcuts}" />

<style lang="scss">
  .container {
    display: grid;
    grid-template-columns: 40% 60%;
    height: 100%;
    width: 100%;
  }

  .sidebar {
    border: 1px solid red;
  }

  .searchBox {
    width: calc(100% - 0.8em);
    margin: 0.4em;
    padding: 0.2em;
    padding-left: 0.4em;
    border-radius: 0.2em;
  }

  .pluginList {
    border: 1px solid yellow;
  }

  .pluginItem {
    display: grid;
    grid-template-rows: 1.4em 0.8em;
    color: white;
    padding: 0.4em;

    .title {
      font-size: 1em;
      font-weight: bold;
    }

    .id {
      font-size: 0.6em;
      padding-left: 0.4em;
    }
  }

  .pluginPage {
    display: grid;
    grid-template-rows: 20% 80%;
    border: 1px solid blue;
    color: white;

    .banner {
      border: 1px solid green;
    }

    .readmeBox {
    }
  }
</style>
