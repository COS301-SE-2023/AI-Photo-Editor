<script>
  import { graphStore } from "../stores/GraphStore";
  // import { remote } from "electron"
  let selectedImage = null;

  let src = "";

  window.api.receive("chosenFile", (base64) => {
    src = `data:image/jpg;base64,${base64}`;
  });

  window.api.receive("selected-file", (base64) => {
    graphStore.set({ nodes: [] });
    src = `data:image/jpg;base64,${base64}`;
  });

  window.api.receive("pong", (value) => {
    console.log(value);
  });

  function chooseFile() {
    window.api.chooseFile();
  }

  function importImage() {
    window.api.send("open-file-dialog");
  }

  function handleFileInput(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      selectedImage = reader.result;
    };
    reader.readAsDataURL(file);
  }

  graphStore.subscribe((store) => {
    let data = {};

    store.nodes.forEach((n) => {
      // @ts-ignore
      data[n.id] = n.slider?.value || 0;
    });

    window.api.send("editPhoto", data);
  });
</script>

<!-- <label for="imageInput">Select an image:</label>
<input type="file" id="imageInput" on:change={handleFileInput} accept="image/*">

{#if selectedImage}
<img src alt="Selected image">
{/if} -->

{#if src}
  <img src="{src}" alt="" class="max-h-[600px]" />
{:else}
  <button on:click="{importImage}" class="h-10 w-24 rounded bg-zinc-600 hover:border-white"
    >Import</button
  >
{/if}
