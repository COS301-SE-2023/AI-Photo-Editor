// Here we define node UIs and callbacks
// import fs from "fs";
// import { dialog } from "electron";
const nodes = {}

// Here we define commands (that are made available in the command palette) and their callbacks
const commands = {
    
    // "open": (context) => {
    //     context.setDescription("Open a project");
    //     context.setIcon("testing/image.jpg");
    //     context.setDisplayName("Open Project");
    //     context.addCommand(() => {
    //         context.getBlix().importProject();
    //     })
    //     return context.create();
    // },
    // "saveas": (context) => {
    //     context.setDescription("Save project to user storage");
    //     context.setIcon("testing/image.jpg");
    //     context.setDisplayName("Save project as...");
    //     context.addCommand((options) => {
    //         context.getBlix().saveProjectAs(options.data.id);
    //     })
    //     return context.create();
    // },
    // "save": (context) => {
    //     context.setDescription("Save project");
    //     context.setIcon("testing/image.jpg");
    //     context.setDisplayName("Save project");
    //     context.addCommand((options) => {
    //         context.getBlix().saveProject(options.data.id);
    //     })
    //     return context.create();
    // }
}

// Here we define custom tiles for the UI
const tiles = {}

module.exports = {
    nodes,
    commands,
    tiles
};