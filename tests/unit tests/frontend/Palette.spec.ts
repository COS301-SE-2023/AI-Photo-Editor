/**
 * @jest-environment jsdom
 */

import { render, fireEvent } from '@testing-library/svelte';
import Palette from "../../../src/frontend/components/Palette.svelte";

describe("Component test", () => {

  it("should render properly", () => {
    const result = render(Palette);
    expect(() => result).not.toThrow();
  })
});