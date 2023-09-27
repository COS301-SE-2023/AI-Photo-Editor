<script lang="ts">
  import { faPuzzlePiece } from "@fortawesome/free-solid-svg-icons";
  import { blixStore } from "../../../lib/stores/BlixStore";
  import Shortcuts from "../../utils/Shortcuts.svelte";
  import Markdown from "./utils/Markdown.svelte";
  import Fa from "svelte-fa";

  let selectedPlugin: string | null = null;

  let searchQuery = "";

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
    hello: {
      name: "Hello Plugin",
      md: "# Hello plugin\n\n> This is a plugin with basic dev testing nodes",
      installed: true,
      enabled: false,
    },
    glfx: {
      name: "GLFX Plugin",
      md: "# GLFX Plugin\n\nThis is a plugin that uses the GLFX library to apply effects to images",
      installed: true,
      enabled: true,
    },
    input: {
      name: "Input Primitives",
      md: `# Input Plugin

The Input Plugin is a fundamental component of Blix, our AI photo editor. It provides various nodes that enable users to incorporate different types of inputs into the photo editing graph. These inputs can include integers, real numbers, images, and more.
Features

The Input Plugin offers the following key features:

    Integer Input: Allows users to input integer values into the editing graph.
    Real Number Input: Enables users to input real numbers (floating-point values) into the editing graph.
    Image Input: Provides the ability to import images as inputs for the editing graph.
    Text Input: Allows users to input text or string values into the editing graph.
    Color Input: Enables users to specify color values using various color models such as RGB or hexadecimal codes.

How to Use

To use the Input Plugin and its corresponding nodes within the Blix photo editor, follow these steps:

    Open the Blix photo editor and create a new project.
    Access the editing graph or workspace.
    Locate the desired Input Plugin node within the available nodes.
    Drag and drop the Input Plugin node into the graph.
    Connect the input nodes to the desired locations in the graph.
    Configure the Input Plugin node based on the type of input required (number, image, text, or color).
    Provide the necessary values or select the appropriate files for the input.
    Save the changes and observe the effects on the image or subsequent nodes in the graph.

Please note that the Input Plugin nodes can be combined with other nodes and plugins within the photo editing graph to create complex and customized effects based on the provided inputs.
Plugin Development

If you are interested in developing additional functionalities for the Input Plugin or creating your own plugins for Blix, please refer to our developer documentation. It provides comprehensive guidelines and resources to assist you in extending the capabilities of our photo editor.
Feedback and Support

We highly value your feedback and are dedicated to continuously improving Blix and its plugins. If you encounter any issues, have suggestions for improvement, or require assistance, please don't hesitate to reach out to our support team. We are here to help you make the most out of your photo editing experience with Blix.


License

The Input Plugin is released under the [GNU GENERAL PUBLIC LICENSE] license. Please review the license file for more information regarding the terms of use and redistribution.

Enjoy using the Input Plugin in Blix, and explore the versatility of incorporating various types of inputs into your photo editing projects!
`,
      installed: true,
      enabled: true,
    },
    logic: {
      name: "Logic Utils",
      md: `# Logic Plugin

The Logic Plugin is an essential component of Blix, our AI photo editor. It offers a wide range of basic arithmetic operations, enabling users to perform mathematical manipulations on images within the photo editing graph.
Features

The Logic Plugin provides some of the following key features:

    Boolean operations: Perform AND/OR/NOT operations on boolean values.
    Logical comparisons: Perform comparison operations on numerical values.

How to Use

To use the Logic Plugin within the Blix photo editor, follow these steps:

    Open the Blix photo editor and create a new project.
    Access the editing graph or workspace.
    Locate the Logic Plugin nodes within the available nodes.
    Drag and drop the Logic Plugin node into the graph.
    Connect the input and output nodes to the desired locations in the graph.
    Manipulate the node through the provided components.
    Observe the effects on the image.

Please note that the Logic Plugin can be used in combination with other nodes and plugins within the photo editing graph to achieve complex and customized effects.

Plugin Development

If you are interested in developing additional functionalities for the Logic Plugin or creating your own plugins for Blix, please refer to our developer documentation. It provides comprehensive guidelines and resources to help you extend the capabilities of our photo editor.
Feedback and Support

We highly value your feedback and are dedicated to continuously improving Blix and its plugins. If you encounter any issues, have suggestions for improvement, or need assistance, please don't hesitate to reach out to our support team. We are here to help you make the most out of your photo editing experience with Blix.
License

The Logic Plugin is released under the [GNU GENERAL PUBLIC LICENSE] license. Please review the license file for more information regarding the terms of use and redistribution.

Enjoy using the Logic Plugin in Blix, and have fun exploring the possibilities of mathematical transformations in your photo editing projects!
`,
      installed: true,
      enabled: true,
    },
    math: {
      name: "Math Utils",
      md: `# Math Plugin

The Math Plugin is an essential component of Blix, our AI photo editor. It offers a wide range of basic arithmetic operations, enabling users to perform mathematical manipulations on images within the photo editing graph.
Features

The Math Plugin provides some of the following key features:

    Addition: Perform addition operations on numerical values.
    Subtraction: Perform subtraction operations on numerical values.
    Multiplication: Perform multiplication operations on numerical values.
    Division: Perform division operations on numerical values.
    Exponentiation: Apply exponentiation operations to numerical values.
    Absolute Value: Calculate the absolute value of a numerical value.
    Minimum: Determine the minimum value between two numerical values.
    Maximum: Determine the maximum value between two numerical values.

How to Use

To use the Math Plugin within the Blix photo editor, follow these steps:

    Open the Blix photo editor and create a new project.
    Access the editing graph or workspace.
    Locate the Math Plugin nodes within the available nodes.
    Drag and drop the Math Plugin node into the graph.
    Connect the input and output nodes to the desired locations in the graph.
    Manipulate the node through the provided components.
    Observe the effects on the image.

Please note that the Math Plugin can be used in combination with other nodes and plugins within the photo editing graph to achieve complex and customized effects.

Plugin Development

If you are interested in developing additional functionalities for the Math Plugin or creating your own plugins for Blix, please refer to our developer documentation. It provides comprehensive guidelines and resources to help you extend the capabilities of our photo editor.
Feedback and Support

We highly value your feedback and are dedicated to continuously improving Blix and its plugins. If you encounter any issues, have suggestions for improvement, or need assistance, please don't hesitate to reach out to our support team. We are here to help you make the most out of your photo editing experience with Blix.
License

The Math Plugin is released under the [GNU GENERAL PUBLIC LICENSE] license. Please review the license file for more information regarding the terms of use and redistribution.

Enjoy using the Math Plugin in Blix, and have fun exploring the possibilities of mathematical transformations in your photo editing projects!
`,
      installed: true,
      enabled: true,
    },
    blink: {
      name: "Blink",
      md: `# Blink

> Blink is a non-destructive image editing plugin for Blix.

### Features
- Layering
- Blending
- Filters
- Shapes
- Painting
- Resizing
- Text Overlays

### Contributions
If you are interested in contributing to Blink's development or creating your own plugins for Blix, please refer to our developer documentation.


### Feedback and Support
We highly value your feedback and are dedicated to continuously improving Blix and its plugins. If you encounter any issues, have suggestions for improvement, or need assistance, please don't hesitate to reach out to our support team. We are here to help you make the most out of your photo editing experience with Blix.


### License
The Blink Plugin is released under the [GNU GENERAL PUBLIC LICENSE] license. Please review the license file for more information regarding the terms of use and redistribution.
`,
      installed: true,
      enabled: true,
    },
  };

  const shortcuts = {
    "blix.pluginBrowser.deselectPlugin": () => {
      selectedPlugin = null;
    },
  };

  function getFilteredPlugins() {
    if (searchQuery === "") return Object.keys(plugins);

    return Object.keys(plugins).filter((id) => {
      const plugin = plugins[id];
      return (
        plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }
</script>

{#if !$blixStore.production}
  <div class="container">
    <div class="sidebar">
      <!-- Search box -->
      <input type="text" class="searchBox bg-zinc-800 text-white" bind:value="{searchQuery}" />
      <div class="pluginList">
        {#key searchQuery}
          {#each getFilteredPlugins() as pluginId}
            {@const plugin = plugins[pluginId]}
            <div
              class="pluginItem {selectedPlugin === pluginId ? 'selected' : ''}"
              on:click|stopPropagation="{() => (selectedPlugin = pluginId)}"
              on:keypress
            >
              <div class="icon">
                <Fa icon="{faPuzzlePiece}" scale="2em" translateX="1.1em" translateY="1.1em" />
              </div>
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
        {/key}
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
{:else}
  <div class="flex h-full w-full items-center justify-center text-xl text-zinc-400">
    Coming soon...
  </div>
{/if}

<Shortcuts shortcuts="{shortcuts}" />

<style lang="scss">
  .container {
    display: grid;
    grid-template-columns: 40% 60%;
    height: 100%;
    width: 100%;
  }

  .sidebar {
    // border: 1px solid red;
  }

  .searchBox {
    width: calc(100% - 1.2em);
    margin: 0.6em;
    padding: 0.2em;
    padding-left: 0.4em;
    border-radius: 0.2em;
    outline: none;
  }

  .pluginList {
    // border: 1px solid yellow;
  }

  .pluginItem {
    display: grid;
    grid-template-columns: 3em auto;
    color: #ffffffee;
    padding: 0.4em;
    height: 4em;

    .icon {
      height: 100%;
      width: 100%;
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

  .selected {
    background-color: #ffffff10;
  }

  .pluginPage {
    display: grid;
    grid-template-rows: 8em auto;
    color: white;
    box-shadow: inset 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
    overflow-y: auto;

    .banner {
      // border: 1px solid green;
      padding: 2.4em;
      padding-top: 1.6em;
      box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
      background-color: #00000060;

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
      background-color: #00000020;
    }
  }
</style>
