// Here we define node UIs and callbacks
const nodes = { 
    "hello": (context) => {
        // Use context.nodeBuilder to construct the node UI
        context.nodeBuilder.reset();
        context.nodeBuilder.addTitle();
    }
}

// Here we define commands (that are made available in the command palette) and their callbacks
const commands = {
    "sayHello": (context) => {
        // TODO: Work this out
        // E.g. Could get context.command.inputs for instance for additional values
        console.log("Hello from command!");
        console.log("Blix version reported as " + inputs.context.blixVersion);
        return {
            "signature": "sayHello",
        }
    }
}

// Here we define custom tiles for the UI
const tiles = {
    "helloTile": (context) => {
        // Use context.tileBuilder to construct the tile UI
    }
}

module.exports = {
    nodes,
    commands,
    tiles
};