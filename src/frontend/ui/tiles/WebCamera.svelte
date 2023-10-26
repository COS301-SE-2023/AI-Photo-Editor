<script lang="ts">
  import { onMount } from "svelte";
  import { cacheStore } from "../../lib/stores/CacheStore";
  import { set } from "zod";

  const ws = new WebSocket("ws://localhost:60606");

  let videoStream: HTMLVideoElement;
  let loading = true;
  // let pictureUrl;
  // @ts-ignore
  let capture: ImageCapture;
  let pictureUrl: string;

  onMount(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoStream.srcObject = stream;
      videoStream.play();

      capture = getImageCapture(stream);

      setTimeout(() => {
        loading = false;
      }, 1000);
      // loading = false;
    } catch (error) {
      console.log(error);
    }
  });

  function getImageCapture(mediaStream: MediaStream) {
    const track = mediaStream.getVideoTracks()[0];
    // @ts-ignore
    return new ImageCapture(track);
  }

  function takePicture() {
    capture
      .grabFrame()
      .then((imageBitmap: ImageBitmap) => {
        // ws.send(blob);
        console.log(imageBitmap);
        // cacheStore.addCacheObject(blob, {contentType: "image/png", name: `Webcam Capture ${Math.floor(100000 * Math.random())}`})
        // pictureUrl = URL.createObjectURL(blob);
        // cacheStore.refreshStore(pictureUrl);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;

        context?.drawImage(imageBitmap, 0, 0);

        canvas.toBlob((blob) => {
          // const blobUrl = URL.createObjectURL(blob);
          if (blob)
            cacheStore.addCacheObject(blob, {
              contentType: "image/png",
              name: `Webcam Capture ${Math.floor(100000 * Math.random())}`,
            });
        }, "image/png"); // You can specify the MIME type here
      })
      .catch((err: string) => console.log("Error while taking photo ", err));
  }
</script>

<div class="flex h-full w-full flex-col items-center justify-center overflow-hidden p-8">
  <!-- svelte-ignore a11y-media-has-caption -->
  <video
    width="100%"
    height="auto"
    bind:this="{videoStream}"
    class="{loading ? 'hidden' : ''} w-full"></video>
  {#if loading}
    <p class="text-3xl text-zinc-400">Loading...</p>
  {:else}
    <div
      class="mt-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 p-2 transition-colors duration-200 ease-in-out hover:bg-primary-600"
      on:click="{takePicture}"
      on:keydown="{takePicture}"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        class="h-10 w-10 text-zinc-200"
      >
        <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z"></path>
        <path
          fill-rule="evenodd"
          d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clip-rule="evenodd"></path>
      </svg>
    </div>
  {/if}
</div>
