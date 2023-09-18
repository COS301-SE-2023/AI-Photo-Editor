import { spawn } from 'child_process';
import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import css from 'rollup-plugin-css-only';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			// server = spawn('npm', ['run', 'start', '--', '--dev'], {
			// 	stdio: ['ignore', 'inherit', 'inherit'],
			// 	shell: true
			// });

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'webview/app.ts',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'dist/bundle.js'
	},
	plugins: [
		svelte({
			preprocess: sveltePreprocess({ sourceMap: !production }),
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({ output: 'bundle.css' }),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			dedupe: ['svelte'],
			preferBuiltins: false,
			exportConditions: ['svelte']
		}),

		typescript({
			tsconfig: './tsconfig.json',
			sourceMap: !production,
			inlineSources: !production,
			// compilerOptions: {
			// 	noUnusedLocals: false
			// }
		}),

		// Important to allow node modules to be imported in .svelte files
		nodePolyfills(),
		commonjs({
			include: 'node_modules/**',
		}),

		serve({
			// open: true, // Open browser automatically
			// verbose: true,
			// contentBase: ['src', 'dist'],

			// host: 'localhost',
			// port: 3000,
		}),

		// Watch the `dist` directory and refresh the
		// browser on changes when not in production
		!production && livereload({
			watch: 'dist'
		}),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};