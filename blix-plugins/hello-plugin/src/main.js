const activate = (context) => {
    console.log("Hello from plugin!");
    console.log("Blix version reported as " + context.blixVersion);
    return "The quick brown fox jumps over the lazy dog";
}

module.exports = {
    activate,
};