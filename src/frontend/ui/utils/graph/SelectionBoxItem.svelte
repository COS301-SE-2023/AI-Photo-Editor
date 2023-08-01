<script lang="ts">
  import type { SelectionBoxItem } from "../../../types/selection-box";
  import { createEventDispatcher } from "svelte";

  type ItemEvents = {
    editItem: {
      newItem: SelectionBoxItem;
    };
    removeItem: {
      id: string;
    };
    selectItem: {
      id: string;
    };
  };

  const dispatch = createEventDispatcher<ItemEvents>();

  export let item: SelectionBoxItem;
  export let selected = false;
  export let removable = false;

  let editing = false;

  function toggleEdit() {
    editing = true;
  }

  function handleEdit(event: KeyboardEvent, item: SelectionBoxItem): void {
    let pressedKey = event.key;
    let targetElement = event.target as HTMLInputElement;
    let newTitle = targetElement.value;
    item.title = newTitle;

    switch (pressedKey) {
      case "Escape":
        targetElement.blur();
        break;
      case "Enter":
        targetElement.blur();
        dispatch("editItem", { newItem: item });
        break;
    }
  }

  function handleBlur(event: FocusEvent, item: SelectionBoxItem): void {
    let targetElement = event.target as HTMLInputElement;
    let newTitle = targetElement.value;
    item.title = newTitle;

    dispatch("editItem", { newItem: item });

    targetElement.blur();
    editing = false;
  }
</script>

<li
  class="flex w-full cursor-pointer items-center rounded-md p-1 text-zinc-400 active:bg-rose-400/5 {selected
    ? 'bg-rose-300/[0.08]'
    : ''} group hover:bg-rose-300/5"
  on:click="{() => dispatch('selectItem', { id: item.id })}"
  on:dblclick="{toggleEdit}"
  on:keydown="{null}"
>
  {#if editing}
    <input
      on:keydown="{(event) => handleEdit(event, { ...item })}"
      on:blur="{(event) => handleBlur(event, { ...item })}"
      class="mr-1 w-full border-none bg-transparent text-sm caret-rose-400 outline-none"
      type="text"
      value="{item.title}"
      autofocus
    />
  {:else}
    <span class="mr-1 w-full truncate text-sm" title="{item.title}">
      {item.title}
    </span>
  {/if}
  {#if removable}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.2"
      stroke="currentColor"
      class="invisible ml-auto h-4 w-4 hover:stroke-rose-500 group-hover:visible"
      on:click="{() => dispatch('removeItem', { id: item.id })}"
      on:keydown="{null}"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      ></path>
    </svg>
  {/if}
</li>
