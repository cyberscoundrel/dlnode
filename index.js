"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dlnode_1 = require("./src/dlnode");
let nodes = [];
Array.from(Array(25)).forEach((e, i) => {
    nodes.push(new dlnode_1.DLayerNode(3030, `secret${i}`));
    nodes[i].deploy();
});
