<script lang="ts">
  import Shortcuts from "../../utils/Shortcuts.svelte";
  import Markdown from "./utils/Markdown.svelte";

  let selectedPlugin: string | null = null;

  type PluginData = {
    name: string;
    md: string;
    installed: boolean;
    enabled: boolean;
  };

  function installPlugin(id: string) {
    plugins[id].installed = true;
    plugins[id].enabled = true;
  }

  function uninstallPlugin(id: string) {
    plugins[id].installed = false;
    plugins[id].enabled = false;
  }

  function enablePlugin(id: string) {
    plugins[id].enabled = true;
  }

  function disablePlugin(id: string) {
    plugins[id].enabled = false;
  }

  const plugins: { [key: string]: PluginData } = {
    "hello-plugin": {
      name: "Hello Plugin",
      md: "# Hello plugin\n\n> This is a plugin with basic dev testing nodes",
      installed: true,
      enabled: false,
    },
    "glfx-plugin": {
      name: "GLFX Plugin",
      md: "# GLFX Plugin\n\nThis is a plugin that uses the GLFX library to apply effects to images",
      installed: false,
      enabled: false,
    },
    blink: {
      name: "Blink",
      md: "# Blink\n\n> A feature-rich plugin for non-destructive image editing",
      installed: true,
      enabled: true,
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
          <div class="icon"></div>
          <div class="details">
            <div class="title">{plugin.name}</div>
            <div class="info">
              {pluginId}
              <span class="float-right italic"
                >{plugin.installed ? (plugin.enabled ? "Installed" : "Disabled") : ""}</span
              >
            </div>
          </div>
        </div>
        <hr class="m-auto w-[97%]" />
      {/each}
    </div>
  </div>
  <div class="pluginPage">
    {#if selectedPlugin != null}
      {@const id = selectedPlugin}
      {@const plugin = plugins[id]}
      <div class="banner">
        <div class="title">{plugin.name}</div>
        <div class="id">{selectedPlugin}</div>
        <div class="buttons">
          {#if plugin.installed}
            <button on:click="{() => uninstallPlugin(id)}">Uninstall</button>
            {#if plugin.enabled}
              <button on:click="{() => disablePlugin(id)}">Disable</button>
            {:else}
              <button on:click="{() => enablePlugin(id)}">Enable</button>
            {/if}
          {:else}
            <button on:click="{() => installPlugin(id)}">Install</button>
          {/if}
        </div>
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
    grid-template-columns: 3em auto;
    color: white;
    padding: 0.4em;
    height: 4em;

    .icon {
      height: 100%;
      width: 100%;
      border: 1px solid magenta;
    }

    .details {
      display: grid;
      grid-template-rows: 1.4em 0.8em;
      padding: 0.4em;

      .title {
        font-size: 1em;
        font-weight: bold;
      }

      .info {
        font-size: 0.6em;
        padding-left: 0.4em;
      }
    }
  }

  .pluginPage {
    display: grid;
    grid-template-rows: 20% 80%;
    border: 1px solid blue;
    color: white;

    .banner {
      border: 1px solid green;
      padding: 1em;
      padding-top: 1.6em;

      .title {
        font-size: 1.6em;
        font-weight: bold;
        line-height: 0.9em;
      }

      .id {
        font-size: 0.8em;
        margin-left: 1em;
        font-style: italic;
      }

      .buttons {
        margin-top: 0.8em;
        font-size: 0.8em;
        // margin-left: 1em;

        button {
          padding: 0px 0.2em;
        }
      }
    }

    .readmeBox {
    }
  }
</style>
