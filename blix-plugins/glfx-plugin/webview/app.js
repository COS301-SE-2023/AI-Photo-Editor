const App = require('./App.svelte').default;

const app = new App({
	target: document.body,
	props: {
		greeting: "Now you can write Blix plugin webviews with Svelte!"
	}
});

module.exports = app;