import { writable } from "svelte/store";

const createBrightness = () => {
  const { subscribe, set } = writable(0);

  let previousValue = 0;

  const update = (newValue: number) => {
    previousValue = newValue;
    set(newValue);
  };

  return {
    subscribe,
    update,
  };
};

export const brightness = createBrightness();

// const unsubscribe = brightness.subscribe(value => {
// 	console.log(value);
// });

// unsubscribe();
