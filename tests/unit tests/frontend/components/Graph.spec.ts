/**
 * @jest-environment jsdom
 */

import { render, fireEvent } from '@testing-library/svelte';
import Item  from "../../../../src/frontend/components/Item.svelte";

describe("Component test", () => {


// jest.mock("svelvet");
  it("should render properly", () => {
    const result = render(Item);
    expect(() => result).not.toThrow();
  })
});