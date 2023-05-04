<!-- The little panel edit dot at the top left of each panel, -->
<!-- tracks mouse movement on drag and returns a direction -->
<script lang="ts">
    let startPos: [number, number]|null = null;
    let dir = "";

    // Calculates the drag direction from start to end position
    function getDirection(endPos: [number, number]): "u"|"d"|"l"|"r"|null {
        if (startPos === null) return null;

        let delta = [endPos[0] - startPos[0], endPos[1] - startPos[1]];

        // Ignore insufficient magnitude
        const minSqrMag = 20*20; // 20px min drag distance

        if (delta[0]**2 + delta[1]**2 < minSqrMag) return null;

        // Determine delta direction
        if (Math.abs(delta[0]) > Math.abs(delta[1])) { //Direction is horizontal
            return delta[0] > 0 ? "r" : "l";
        }
        else { //Direction is vertical
            return delta[1] > 0 ? "d" : "u";
        }
    }

    function tryStartTrack(e: MouseEvent) {
        console.log("TRY START");
        startPos = [e.screenX, e.screenY];
    }

    function tryEndTrack(e: MouseEvent) {
        console.log("TRY END");
        if (startPos !== null) {
            let endPos: [number, number] = [e.screenX, e.screenY];

            let dir = getDirection(endPos);

            console.log(dir + "\n" + startPos + "\n" + endPos);
        }
        startPos = null;
    }

    function mapToCaret(dir: string) {
        switch(dir) {
            case "u": return "^";
            case "d": return "v";
            case "l": return "<";
            case "r": return ">";
            default:  return "";
        }
    }

    function winMouseMove(e: MouseEvent) {
        if (startPos !== null) {
            let endPos: [number, number] = [e.screenX, e.screenY];

            // Update UI
            let d = getDirection(endPos);

            dir = (d === null ? "" : mapToCaret(d));
        }
        else { //Reset UI
            dir = "";
        }
    }
</script>

<style>
    :root {
        --width: 1em;
    }
    .blip {
        position: absolute;
        top: 0px;
        left: 0px;

        width: var(--width);
        height: var(--width);
        border-radius: 0px 0px calc(var(--width)/2) 0px;

        background-color: grey;
        color: white;
        text-align: center;
        font-size: 0.8em;

        /* Prevent mouse selecting neighbouring elements when dragging */
        user-select: none;
    }
</style>

<div
    class="blip"
    on:mousedown={tryStartTrack}
>
    {dir}
</div>
<svelte:window on:mouseup={tryEndTrack} on:mousemove={winMouseMove} />