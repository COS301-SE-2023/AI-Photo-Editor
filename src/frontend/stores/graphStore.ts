import { writable } from "svelte/store";

type Inputs = {
	brightness: number;
}

let inputs: Inputs = writable({ brightness: 1 });