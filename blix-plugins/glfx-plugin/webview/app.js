const { writable } = require('svelte/store');
const App = require('./App.svelte').default;

const media = writable({});

const app = new App({
	target: document.body,
	props: { media },
});

module.exports.default = app;
// module.exports.dispatchMessage = (message) => { notifyMessageSubscribers(message); return "asdfHello"; };

// window.api.on("testMessage", (data) => {
//   console.log(`Received ${data} from main process`);
// });

window.addEventListener("DOMContentLoaded", async () => {
    window.api.on("mediaChanged", (newMedia) => {
		media.set(newMedia);

		// To send a message back
		// window.api.send("backTestMessage", "Hello from app.js");
    });

});