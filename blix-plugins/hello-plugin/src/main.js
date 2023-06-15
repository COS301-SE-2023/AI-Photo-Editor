// Here we define node UIs and callbacks
const nodes = { 
    "hello": (context) => {
        // Use context.nodeBuilder to construct the node UI
        context.nodeBuilder.reset();
        context.nodeBuilder.addTitle();
        //context.compile();
    }
}

// Here we define commands (that are made available in the command palette) and their callbacks
const commands = {
    "sayHello": (context) => {
        // TODO: Work this out
        // E.g. Could get context.command.inputs for instance for additional values
    
        context.setDescription("sayHello command");

        context.setIcon("testing/image.jpg");

        context.addCommand(() => {
            console.log("hello");
        })

        return context.create();
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