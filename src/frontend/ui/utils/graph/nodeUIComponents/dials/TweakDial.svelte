<script lang="ts">
  import { UIValueStore } from "@shared/ui/UIGraph";
  import type { UIComponentConfig, UIComponentProps } from "@shared/ui/NodeUITypes";
  import { faCogs } from "@fortawesome/free-solid-svg-icons";
  import Dial from "./Dial.svelte";
  import { blixStore } from "../../../../../lib/stores/BlixStore";

  export let props: UIComponentProps;
  export let inputStore: UIValueStore;
  export let config: UIComponentConfig;
</script>

<Dial props="{props}" inputStore="{inputStore}" config="{config}" icon="{faCogs}" />
