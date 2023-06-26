/**
 * @jest-environment jsdom
 */

import { render, fireEvent } from '@testing-library/svelte';
import Item from "../../../../src/frontend/components/Item.svelte";

describe("Component test", () => {
  const props = {
    selected:  false,
    title: "component-custom",
  };  
  it("should render properly", () => {
    const result = render(Item,{props});
    expect(() => result).not.toThrow();
  })


});