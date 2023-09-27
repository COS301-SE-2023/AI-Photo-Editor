<script lang="ts">
  import { marked } from "marked";

  export let markdown: string = "";
</script>

<div class="container">{@html marked(markdown)}</div>

<style lang="scss">
  .container {
    height: 100%;
    width: 100%;
    padding: 1em;
    margin: 0px;

    color: #ffffffee;
  }

  /* Markdown styling */
  .container {
    :global(h1),
    :global(h2),
    :global(h3),
    :global(h4),
    :global(h5),
    :global(h5),
    :global(h6) {
      font-weight: bold;
      padding-top: 0.6em;
      padding-bottom: 0.4em;
    }
    :global(h1) {
      font-size: 2em;
    }
    :global(h2) {
      font-size: 1.8em;
    }
    :global(h3) {
      font-size: 1.6em;
    }
    :global(h4) {
      font-size: 1.4em;
    }
    :global(h5) {
      font-size: 1.2em;
    }
    :global(h6) {
      font-size: 1.1em;
    }

    :global(ul) {
      list-style: disc;
      margin-left: 2.4em;
    }

    :global(ol) {
      list-style: decimal;
      margin-left: 2.4em;
    }

    :global(table),
    :global(th),
    :global(td) {
      border: 1px solid white;
      border-collapse: collapse;
    }

    :global(td) {
      padding: 0.2em;
    }

    :global(p) {
      padding: 0.4em;
      font-size: 0.8em;
    }

    :global(code) {
      font-size: 0.7em;
      display: inline-block;
      background-color: #161616;
      border-radius: 0.2em;
      padding: 0.4em;
    }
  }
</style>
