<script>
	// import { remote } from "electron"
	let selectedImage = null;

	let src =  '';

	window.api.receive("chosenFile", (base64) => {
		src = `data:image/jpg;base64,${base64}`
		console.log(src)
	});

	window.api.receive("pong", (value) => {
		console.log(value);
	});

	function chooseFile() {
		window.api.chooseFile();
	}
  
	function handleFileInput(event) {
	  const file = event.target.files[0];
	  const reader = new FileReader();
	  reader.onload = () => {
		selectedImage = reader.result;
	  };
	  reader.readAsDataURL(file);
	}
</script>
  
<!-- <label for="imageInput">Select an image:</label>
<input type="file" id="imageInput" on:change={handleFileInput} accept="image/*">

{#if selectedImage}
<img src alt="Selected image">
{/if} -->

{#if src}
	<img src={src} alt="Selected image">
{:else}
	<button on:click={chooseFile}>Click Me</button>
{/if}
  