// Here we define node UIs and callbacks
// import fs from "fs";
// import { dialog } from "electron";
const nodes = { 
    // "hello": (context) => {
    //     // Use context.nodeBuilder to construct the node UI
    //     nodeBuilder = context.instantiate("hello-plugin","hello");
    //     nodeBuilder.setTitle("Gloria");
    //     nodeBuilder.define(() => {
    //         console.log("konnichi~wa");
    //     });

    //    ui =  nodeBuilder.createUIBuilder();
    //    ui.addButton("Execute order 66","return 66;").addSlider("Slide along",0,100,0.1,50).addDropdown("Orphanage",nodeBuilder.createUIBuilder()
    //    .addLabel("Label1"));   

    //    nodeBuilder.addInput("string","In1");
    //    nodeBuilder.addInput("string","In2");

    //    nodeBuilder.addOutput("string","Out1");

    // }
    // ,"Jake": (context) => {
    //     nodeBuilder = context.instantiate("hello-plugin","Jake");
    //     console.log("Jake");
    // }
}



// Here we define commands (that are made available in the command palette) and their callbacks
const commands = {
    
    "import": (context) => {
        // TODO: Work this out
        // E.g. Could get context.command.inputs for instance for additional values
    
        context.setDescription("Import a project");

        context.setIcon("testing/image.jpg");

        context.setDisplayName("Import Project");

        context.addCommand(() => {
            context.createDialogBox();
            console.log("Import project");
        })

        return context.create();
    },
    "export": (context) => {
        // TODO: Work this out
        // E.g. Could get context.command.inputs for instance for additional values
    
        context.setDescription("Export a project");

        context.setIcon("testing/image.jpg");

        context.setDisplayName("Export project");

        // Very unsafe, but just for proof of concept
        context.addCommand(() => {
            console.log("Export project");
            context.createDialogBox(); // For opening a file
        })

        return context.create();
    }
}

// Here we define custom tiles for the UI
const tiles = {
    // "helloTile": (context) => {
    //     // Use context.tileBuilder to construct the tile UI
    // }
}

module.exports = {
    nodes,
    commands,
    tiles
};