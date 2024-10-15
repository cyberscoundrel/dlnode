"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dlnode_1 = require("../../dlnode");
const monitorlayer_1 = require("../../monitorlayer");
const path_1 = __importDefault(require("path"));
const portfinder_1 = __importDefault(require("portfinder"));
const testEnv = (size = 25, peerCount = 5) => {
    let dc = size - 1;
    Array.from(Array(size)).forEach((e, i) => {
        console.log(`pushing server with target port ${3030 + i}`);
        console.log(`index ${i}`);
        nodes.push(new dlnode_1.DLayerNode(3030 + i, `secret${i}`));
        nodes[i].deploy().then((p) => {
            console.log(`passed port ${p}`);
            console.log(`depoloying monitor for localhost:${p}`);
            let peerCount = 5;
            mnodes.push(new monitorlayer_1.DLMonitorLayer(p + 100, nodes[i]));
            dc -= 1;
            if (dc == 0) {
                console.log(`peers time`);
                nodes.forEach((e, i) => {
                    e.addPeers(Array.from(Array(peerCount)).map((v, i) => {
                        return `ws://localhost:${nodes[Math.floor(Math.random() * size - 0.01)].port}`;
                    }));
                });
            }
        });
    });
};
const nodes = [];
const mnodes = [];
const app = (0, express_1.default)();
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'dist', 'index.html'));
});
app.get('/bundle.js', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'dist', 'bundle.js'));
});
app.get('/bundle.js.map', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'dist', 'bundle.js.map'));
});
app.get('/output.css', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'dist', 'output.css'));
});
app.get('/instances', (req, res) => {
    res.send(JSON.stringify(mnodes.map((v, i) => {
        return `ws://localhost:${v.port}`;
    })));
});
testEnv();
portfinder_1.default.setBasePort(3000);
let pf = portfinder_1.default.getPortPromise().then((port) => {
    app.listen(port, () => {
        console.log(`dashboard backend listening on ${port}`);
    });
});
