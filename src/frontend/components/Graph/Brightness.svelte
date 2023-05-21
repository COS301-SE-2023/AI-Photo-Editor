<script lang="ts">
  // import NodeWrapper from
  import { Node, Slider, generateInput, generateOutput } from "svelvet";

  // import { brightness } from "../../stores/graphStore";

  window.api.receive("editPhoto", (value: number) => {
    console.log(value);
  });

  const changeBrightness = async (value: any) => {
    window.api.send("editPhoto", value);
  };

  type Inputs = {
    brightness: number;
  };

  const initialData = {
    brightness: 1,
  };

  const inputs = generateInput(initialData);

  let data = {
    brightness: 1.0,
    saturation: 1,
    hue: 0,
    rotate: 20,
    shadow: {
      multiplier: 0.2,
      offset: 2,
    },
  };

  export const processor = (inputs: Inputs) => {
    data.brightness = inputs.brightness;
    //data.saturation = inputs.brightness;
    changeBrightness(data);
    //Increase brightness
    // brightness.update(inputs.brightness);
    return inputs.brightness;
  };
  const output = generateOutput(inputs, processor);
</script>

<Node position="{{ x: 600, y: 200 }}">
  <div class="min-w-64 flex flex-col rounded-lg border-2 border-zinc-500 bg-zinc-700 p-2">
    <div class="mb-4 border-b-2 border-zinc-500">
      <p class="mb-1 font-sans text-base text-white">Brightness</p>
      <p></p>
    </div>
    <div class="justify-centre flex flex-col items-center">
      <Slider
        min="{0}"
        max="{2}"
        fixed="{1}"
        step="{0.1}"
        parameterStore="{$inputs.brightness}"
        fontColor="white"
        barColor="grey"
        bgColor="black"
      />
    </div>
  </div>
</Node>

<style>
  .node {
    box-sizing: border-box;
    width: fit-content;
    border-radius: 8px;
    height: fit-content;
    position: relative;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    padding: 10px;
    gap: 10px;
  }

  .node-body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  h1 {
    font-size: 0.9rem;
    font-weight: 200;
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    padding-bottom: 8px;
    border-color: inherit;
  }

  .output-anchors {
    position: absolute;
    right: -24px;
    top: 8px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .destroy {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    width: 100%;
    border-bottom: solid 1px;
    border-color: lightgray;
  }
</style>
