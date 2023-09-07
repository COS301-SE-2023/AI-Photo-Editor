import { writable } from 'svelte/store';
import App from './App.svelte';
import { BlinkCanvas } from './clump';

const media = writable<BlinkCanvas>({
	assets: {},
	content: null
});

let sender = (message: string, data: any) => {};

const send = (message: string, data: any) => {
	sender(message, data);
}

const app = new App({
	target: document.body,
	props: { media, send },
});

// Assert window.api is loaded

window.addEventListener("DOMContentLoaded", () => {
    window.api.on("mediaChanged", (newMedia: any) => {
		if (newMedia.assets && newMedia.content) {
			media.set(newMedia);
		}
    });

	// To send a message back to main renderer
	sender = (message: string, data: any) => {
		window.api.send(message, data);
	}
});


// window.cache.write("test", new Blob([]));

export { app };