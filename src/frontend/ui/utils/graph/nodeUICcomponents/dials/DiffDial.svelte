<script lang="ts">
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";
  import Dial from "./Dial.svelte";
  import { faCodeCompare } from "@fortawesome/free-solid-svg-icons";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;
</script>

<Dial props="{props}" inputStore="{inputStore}" config="{config}" icon="{faCodeCompare}" />
