const App = require('./App.svelte').default;

const app = new App({
	target: document.body,
	props: {
		greeting: "Now you can write Blix plugin webviews with Svelte!"
	},
});

module.exports.default = app;
// module.exports.dispatchMessage = (message) => { notifyMessageSubscribers(message); return "asdfHello"; };

// window.api.on("testMessage", (data) => {
//   console.log(`Received ${data} from main process`);
// });

window.addEventListener("DOMContentLoaded", () => {
    window.api.on("testMessage", (data) => {
        console.log(`Received [${data}] from main process in app.js`);
		window.api.send("backTestMessage", "Hello from app.js");
    });
});