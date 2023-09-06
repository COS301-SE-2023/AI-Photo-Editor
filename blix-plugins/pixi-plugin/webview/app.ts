import { writable } from 'svelte/store';
import App from './App.svelte';

const media = writable({});

const app = new App({
	target: document.body,
	props: { media },
});

// Assert window.api is loaded

window.addEventListener("DOMContentLoaded", () => {
    window.api.on("mediaChanged", (newMedia) => {
		media.set(newMedia);

		// To send a message back
		// window.api.send("backTestMessage", "Hello from app.js");
    });
});


window.cache.write("test", new Blob([]));

export { app };