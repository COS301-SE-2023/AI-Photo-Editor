/**
 * @jest-environment jsdom
 */

import { render, fireEvent } from '@testing-library/svelte';
import Item from "../../../src/frontend/components/Item.svelte";

describe("Component test", () => {
  const props = {
    id: "component",
    class: "component-custom",
    style: "width: 100%; height: 100%",
  };  
  it("should render properly", () => {
    const result = render(Item);
    expect(() => result).not.toThrow();
  })
});