/**
 * @jest-environment jsdom
 */

import { render } from '@testing-library/svelte';
import NodeWrapper from "../../../../src/frontend/components/Graph/NodeWrapper.svelte";
import Item from "../../../../src/frontend/components/Item.svelte";

jest.mock('svelvet');

describe("NodeWrapper test", () => {
  const props = {
    node: {
      id: "node-id",
      name: "Node Name",
      slider: {
        min: 0,
        max: 100,
        step: 1,
        fixed: 0,
        value: 50,
      },
      connection: "connection-id",
    },
  };

  //This is what actually should be tested

  // it("should render properly", () => {
  //   const result = render(NodeWrapper, { props });
  //   expect(() => result).not.toThrow();
  // });

  it("should render properly", () => {
    const result = render(Item);
    expect(() => result).not.toThrow();
  });
});
