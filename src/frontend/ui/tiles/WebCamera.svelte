<script lang="ts">
  import { onMount } from "svelte";
  import { cacheStore } from "../../lib/stores/CacheStore";

  const ws = new WebSocket("ws://localhost:60606");

  let videoStream: HTMLVideoElement;
  let loading = false;
  // let pictureUrl;
  // @ts-ignore
  let capture: ImageCapture;
  let pictureUrl: string;

  onMount(async () => {
    try {
      loading = true;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoStream.srcObject = stream;
      videoStream.play();

      capture = getImageCapture(stream);

      loading = false;
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

<div class="camera overflow-auto">
  {#if loading}
    <h1>LOADING</h1>
  {/if}
  <!-- svelte-ignore a11y-media-has-caption -->
  <video class="border border-rose-700" width="100%" height="auto" bind:this="{videoStream}"
  ></video>
  <button on:click="{takePicture}">CAPTURE</button>
</div>

<style>
  .camera {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
</style>
