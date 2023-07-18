// Here we define node UIs and callbacks
// import fs from "fs";
// import { dialog } from "electron";
const nodes = {}

// Here we define commands (that are made available in the command palette) and their callbacks
const commands = {
    
    "open": (context) => {
        // TODO: Work this out
        // E.g. Could get context.command.inputs for instance for additional values
    
        context.setDescription("Open a project");

        context.setIcon("testing/image.jpg");

        context.setDisplayName("Open Project");

        context.addCommand(() => {
            context.loadProject("openFile");
        })

        return context.create();
    },
    "saveas": (context) => {
        // TODO: Work this out
        // E.g. Could get context.command.inputs for instance for additional values
    
        context.setDescription("Save project to user storage");

        context.setIcon("testing/image.jpg");

        context.setDisplayName("Save project as...");

        // Very unsafe, but just for proof of concept
        context.addCommand((options) => {
            // console.log("Save project as...");
            context.saveCurrentProject(options.data);
            // console.log(options.data);
        })

        return context.create();
    },
    "send-prompt": (context) => {
        context.setDescription("Send a user prompt to the ai");
        context.setIcon("testing/image.jpg");

        context.setDisplayName("AI prompt");

        context.addCommand((options) => {
            context.sendPrompt(options.data);
        })

        return context.create();
    },
}

// Here we define custom tiles for the UI
const tiles = {}

module.exports = {
    nodes,
    commands,
    tiles
};