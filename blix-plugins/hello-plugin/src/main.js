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
       ui.addButton("Execute order 66","return 66;").addSlider("Slide along",0,100,0.1,50).addDropdown("Orphanage",nodeBuilder.createUIBuilder()
       .addLabel("Label1"));   

       nodeBuilder.addInput("Number","In1", 0);
       nodeBuilder.addInput("Number","In2", 1);
       nodeBuilder.addInput("Number","In3", 2);

       nodeBuilder.addOutput("Number","Out1", 3);
       nodeBuilder.addOutput("Number","Out2", 4);
    }
    ,"Jake": (context) => {
        nodeBuilder = context.instantiate("hello-plugin","Jake");
    }
}



// Here we define commands (that are made available in the command palette) and their callbacks
const commands = {
    "addBrightnessNode": (context) => {
        // TODO: Work this out
        // E.g. Could get context.command.inputs for instance for additional values
    
        context.setDescription("import a picture");

        context.setIcon("testing/image.jpg");

        context.addCommand(() => {
            console.log("Add Brightness Node");
        })

        context.setDisplayName("Add Brightness Node");

        return context.create();
    },
    "import": (context) => {
        // TODO: Work this out
        // E.g. Could get context.command.inputs for instance for additional values
    
        context.setDescription("import a picture");

        context.setIcon("testing/image.jpg");

        context.setDisplayName("Import Project");

        context.addCommand(() => {
            console.log("Import project");
        })

        return context.create();
    },
    "export": (context) => {
        // TODO: Work this out
        // E.g. Could get context.command.inputs for instance for additional values
    
        context.setDescription("import a picture");

        context.setIcon("testing/image.jpg");

        context.setDisplayName("Export project");

        context.addCommand(() => {
            console.log("Export picture");
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