require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
        module: "CommonJS",
        moduleResolution: "Node"
    }
});

require("../cli")