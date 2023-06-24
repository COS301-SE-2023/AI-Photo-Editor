<script>
  import { paletteStore } from "../stores/PaletteStore";

  let src = "";

  // window.api.receive("chosenFile", (base64) => {
  //   paletteStore.update((store) => ({ ...store, src: `data:image/jpg;base64,${base64}` }));
  // });

  // window.api.receive("selected-file", (base64) => {
  //   graphStore.set({ nodes: [] });
  //   paletteStore.update((store) => ({ ...store, src: `data:image/jpg;base64,${base64}` }));
  // });

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

  // TODO: Remove (OLD SYSTEM)
  // graphStore.subscribe((store) => {
  //   if (store.nodes.length === 0) return;

  //   let data = {};

  //   store.nodes.forEach((n) => {
  //     // @ts-ignore
  //     data[n.id] = n.slider?.value || 0;
  //   });

  //   window.api.send("editPhoto", data);
  // });
</script>

{#if $paletteStore.src}
  <img src="{$paletteStore.src}" alt="" class="max-h-[600px]" />
{:else}
  <div
    class="flex w-full items-center justify-center"
    on:click="{importImage}"
    on:keydown="{importImage}"
  >
    <label
      for="dropzone-file"
      class="h-54 flex w-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-zinc-600 bg-none hover:border-gray-500 hover:bg-zinc-800"
    >
      <div class="flex flex-col items-center justify-center pb-6 pt-5">
        <svg
          aria-hidden="true"
          class="mb-3 h-10 w-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          ></path></svg
        >
        <p class="mb-2 text-sm text-gray-400">
          <span class="font-semibold">Click to import</span>
        </p>
      </div>
    </label>
  </div>
{/if}
