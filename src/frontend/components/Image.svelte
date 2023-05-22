<script>
  import { graphStore } from "../stores/GraphStore";

  let src = "";

  window.api.receive("chosenFile", (base64) => {
    src = `data:image/jpg;base64,${base64}`;
  });

  window.api.receive("selected-file", (base64) => {
    graphStore.set({ nodes: [] });
    src = `data:image/jpg;base64,${base64}`;
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

{#if src}
  <img src="{src}" alt="" class="max-h-[600px]" />
{:else}
  <div
    on:click="{importImage}"
    on:keydown="{importImage}"
    class="flex h-10 w-24 items-center justify-center rounded border border-zinc-500 bg-zinc-600 text-zinc-100 hover:cursor-pointer hover:border-zinc-300 focus:bg-zinc-700"
  >
    Import
  </div>
{/if}
