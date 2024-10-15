"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DLMonitorLayer = void 0;
const ws_1 = __importDefault(require("ws"));
const portfinder_1 = __importDefault(require("portfinder"));
const zodschemas_1 = require("./zodschemas");
class DLMonitorLayer {
    initServer(wss) {
        wss.on('connection', (ws) => {
            ws.on('message', (msg) => {
                try {
                    let parsed = zodschemas_1.DLMonitorRequestZ.parse(JSON.parse(msg.toString()));
                    switch (parsed.type) {
                        case "stat":
                            console.log('stat request');
                            ws.send(JSON.stringify({
                                type: "stat",
                                message: Object.assign({}, this.dln.getStat())
                            }));
                            break;
                        case "query":
                            try {
                                let query = zodschemas_1.DLRequestZ.parse(parsed.message);
                                this.dln.requestContent(query.contentHash.hash);
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        text: `queried hash ${query.contentHash.hash}`
                                    }
                                }));
                            }
                            catch (err) {
                                console.log(err);
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        error: '' + err
                                    }
                                }));
                            }
                            break;
                        case "addCont":
                            try {
                                let newCont = parsed.message.cont;
                                this.dln.addRawContent(newCont);
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        text: `added content ${newCont}: ${this.dln.hash(newCont)}`
                                    }
                                }));
                            }
                            catch (err) {
                                console.log(err);
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        error: '' + err
                                    }
                                }));
                            }
                            break;
                        case "addPeers":
                            try {
                                let newPeers = parsed.message.peers;
                                newPeers.forEach((e, i) => {
                                    this.dln.addPeer(e);
                                });
                                ws.send(JSON.stringify({
                                    type: "stat",
                                    message: Object.assign({}, this.dln.getStat())
                                }));
                            }
                            catch (err) {
                                console.log(err);
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        error: '' + err
                                    }
                                }));
                            }
                            break;
                    }
                }
                catch (err) {
                    console.log(err);
                    ws.send(JSON.stringify({
                        type: "log",
                        message: {
                            error: '' + err
                        }
                    }));
                }
            });
        });
        return wss;
    }
    constructor(port, dln) {
        this.dln = dln;
        this.port = port;
        portfinder_1.default.setBasePort(port);
        portfinder_1.default.getPortPromise().then((p) => {
            this.port = p;
            this.wss = new ws_1.default.Server({
                port: p
            });
            console.log(`motitor layer server listening on port ${p} for node localhost${dln.port}`);
            this.initServer(this.wss);
            this.dln.contentHook((m) => {
                var _a;
                (_a = this.wss) === null || _a === void 0 ? void 0 : _a.clients.forEach((e, i) => {
                    e.send(JSON.stringify({
                        type: "content",
                        message: m
                    }));
                });
            });
            this.dln.logHook((m) => {
                var _a;
                //console.log(`monitor log hook`)
                (_a = this.wss) === null || _a === void 0 ? void 0 : _a.clients.forEach((e, i) => {
                    e.send(JSON.stringify({
                        type: "log",
                        message: m
                    }));
                });
            });
        });
    }
}
exports.DLMonitorLayer = DLMonitorLayer;
/*export class DLMonitorLayerClient{
    url: string
    socket: WebSocket
    handleLog: (m: any) => void = (m: any) => {}
    handleContent: (m: any) => void = (m: any) => {}
    initClient(ws: WebSocket): WebSocket {
        ws.on('message', (msg) => {
            try{
                let parsed = DLMonitorResponseZ.parse(msg)
                switch(parsed.type) {
                    case "log": this.handleLog(parsed.message)
                        break
                    case "content": this.handleContent(parsed.message)
                        break
                }
            }catch(err){
                console.log(err)
            }

        })
        return ws
    }
    constructor(url: string) {
        this.url = url
        this.socket = this.initClient(new WebSocket(this.url))
    }
}*/ 
