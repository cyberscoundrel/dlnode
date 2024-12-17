"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestEnvContentServer = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const portfinder_1 = __importDefault(require("portfinder"));
const dlnode_1 = require("../dlnode");
const fs = __importStar(require("fs"));
class TestEnvContentServer {
    constructor(port, secret = "secret", bootstraps = [], peers = []) {
        this.app = (0, express_1.default)();
        this.port = port;
        this.node = new dlnode_1.DLayerNode(port + 100, secret, bootstraps, peers);
        this.app.get('/content/:contentID', (req, res) => {
            res.sendFile(path_1.default.join(__dirname, 'content', req.params.contentID));
        });
    }
    addContentFile(cid) {
        fs.readFile(path_1.default.join(__dirname, 'content', cid), (err, data) => {
            if (!err) {
                this.node.contentMap.set(this.node.hash(data), `http://localhost:${this.port}/content/${cid}`);
            }
        });
    }
    listen(start) {
        portfinder_1.default.setBasePort(start);
        return portfinder_1.default.getPortPromise().then((p) => {
            this.port = p;
            this.app.listen(p, () => {
                console.log(`DLayer listening on port ${this.port}`);
            });
            return p;
        });
        //if port is used, use next and return port
    }
    deploy() {
        this.node.deploy();
        return this.listen(this.port);
    }
}
exports.TestEnvContentServer = TestEnvContentServer;
