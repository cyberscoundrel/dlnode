"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("./src/node");
let nodes = [];
Array.from(Array(25)).forEach((e, i) => {
    nodes.push(new node_1.DLayerNode(3030, `secret${i}`));
    nodes[i].deploy();
});
