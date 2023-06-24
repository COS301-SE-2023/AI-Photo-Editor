// Here we define node UIs and callbacks
const nodes = { 
    "hello": (context) => {
        // Use context.nodeBuilder to construct the node UI
        nodeBuilder = context.instantiate("hello-plugin","hello");
        nodeBuilder.setTitle("Gloria");


        nodeBuilder.define(() => {
            console.log("konnichi~wa");
        });

       ui =  nodeBuilder.createUIBuilder();
       ui.addButton("bt1","Execute order 66");
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