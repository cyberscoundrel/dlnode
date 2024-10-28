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
const config = {
    networkConfig: {
        labels: ['a', 'b' /*, 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'*/],
        config: {
            'a': {
                peers: ['b']
            },
            'b': {
                peers: ['c']
            }
            /*'a': {
                peers: ['b', 'c']
            },
            'b': {
                peers: ['d', 'e', 'g']
            },
            'c': {
                peers: ['d', 'f', 'g']
            },
            'd': {
                peers: ['h', 'i']
            },
            'e': {
                peers: ['i', 'j']
            },
            'f': {
                peers: ['k', 'j']
            },
            'g': {
                peers: ['j', 'd', 'l']
            },
            'k': {
                peers: ['a', 'c']
            },
            'i': {
                peers: ['b', 'd']
            }*/
        }
    }
};
const randomPeers = (size, peerCount) => {
    nodes.forEach((e, i) => {
        e.addPeers(Array.from(Array(peerCount)).map((v, i) => {
            return `ws://localhost:${nodes[Math.floor(Math.random() * size - 0.01)].port}`;
        }));
    });
};
const testEnv = (size = 25, peerCount = 5, peerSetup = randomPeers) => {
    let dc = size;
    Array.from(Array(size)).forEach((e, i) => {
        console.log(`pushing server with target port ${3030 + i}`);
        console.log(`index ${i}`);
        nodes.push(new dlnode_1.DLayerNode(3030 + i, `secret${i}`));
        nodes[i].deploy().then((p) => {
            console.log(`passed port ${p}`);
            console.log(`depoloying monitor for localhost:${p}`);
            mnodes.push(new monitorlayer_1.DLMonitorLayer(p + 100, nodes[i]));
            dc -= 1;
            if (dc == 0) {
                console.log(`peers time`);
                peerSetup(size, peerCount);
            }
        });
    });
};
const peerSetupWithConfig = () => {
    console.log('peerSetupWithConfig');
    nodes.forEach((e, i) => {
        if (config.networkConfig.config[config.networkConfig.labels[i]]) {
            if (config.networkConfig.config[config.networkConfig.labels[i]].peers) {
                let p = config.networkConfig.config[config.networkConfig.labels[i]].peers;
                p.forEach((em, ind) => {
                    let n = config.networkConfig.labels.indexOf(em);
                    console.log(`add peer ws://localhost:${nodes[n].port}`);
                    e.addPeer(`ws://localhost:${nodes[n].port}`);
                });
            }
            if (config.networkConfig.config[config.networkConfig.labels[i]].eat) {
                e.eat = true;
            }
        }
    });
};
const testEnvWithConfig = () => {
    testEnv(config.networkConfig.labels.length, -1, () => peerSetupWithConfig());
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
testEnvWithConfig();
//testEnv()
portfinder_1.default.setBasePort(3000);
let pf = portfinder_1.default.getPortPromise().then((port) => {
    app.listen(port, () => {
        console.log(`dashboard backend listening on ${port}`);
    });
});
