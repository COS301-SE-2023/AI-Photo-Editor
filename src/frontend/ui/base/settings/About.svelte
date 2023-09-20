<script lang="ts">
  import { getContext, onMount } from "svelte";
  import type { Setting } from "../../../../shared/types";
  import type { SettingsContext } from "./Settings.svelte";
  import SecureInput from "./utils/SecureInput.svelte";

  const { getSetting, saveSettings } = getContext<SettingsContext>("settings");
</script>
