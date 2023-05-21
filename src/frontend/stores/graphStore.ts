import { writable } from "svelte/store";
import type { GraphStore } from "../types/index";

export const graphStore = writable<GraphStore>({
  nodes: [],
});
