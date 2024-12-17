"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DLMonitorLayer = void 0;
const ws_1 = __importDefault(require("ws"));
const portfinder_1 = __importDefault(require("portfinder"));
const zodschemas_1 = require("./zodschemas");
//integrate into dlnode? with trust vs auth
class DLMonitorLayer {
    replacer(key, value) {
        if (value instanceof Map) {
            return {
                dataType: 'Map',
                value: Array.from(value.entries()), // or with spread: value: [...value]
            };
        }
        else {
            return value;
        }
    }
    initServer(wss) {
        wss.on('connection', (ws) => {
            ws.on('message', (msg) => {
                try {
                    let parsed = zodschemas_1.DLMonitorRequestZ.parse(JSON.parse(msg.toString()));
                    switch (parsed.type) {
                        case "stat":
                            console.log('stat request');
                            console.log(JSON.stringify({
                                type: "stat",
                                message: Object.assign({}, this.dln.getStat())
                            }, this.replacer, 3));
                            ws.send(JSON.stringify({
                                type: "stat",
                                message: Object.assign({}, this.dln.getStat())
                            }, this.replacer));
                            break;
                        case "query":
                            try {
                                let query = zodschemas_1.DLRequestZ.parse(parsed.message);
                                this.dln.bowl.RequestContent(query.contentHash.hash, query.hops);
                                console.log(`queried hash ${query.contentHash.hash}`);
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        text: `queried hash ${query.contentHash.hash}`
                                    }
                                }, null, 3));
                            }
                            catch (err) {
                                console.log(err);
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        error: '' + err
                                    }
                                }, null, 3));
                            }
                            break;
                        case "addCont":
                            try {
                                let newCont = parsed.message.cont;
                                let rawCont = this.dln.contentCache.AddRawContent(newCont);
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        text: `added content ${newCont}: ${rawCont.TransformToKey()}`
                                    }
                                }, null, 3));
                            }
                            catch (err) {
                                console.log(err);
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        error: '' + err
                                    }
                                }, null, 3));
                            }
                            break;
                        case "addPeers":
                            try {
                                let newPeers = parsed.message.peers;
                                newPeers.forEach((e, i) => {
                                    this.dln.connectWS([e]);
                                });
                                ws.send(JSON.stringify({
                                    type: "stat",
                                    message: Object.assign({}, this.dln.getStat())
                                }, null, 3));
                            }
                            catch (err) {
                                console.log(err);
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        error: '' + err
                                    }
                                }, null, 3));
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
                    }, null, 3));
                }
            });
        });
        return wss;
    } //constructor option for original dlnode http server
    //to directly implement monitor layer to dlnode for remote management with one http server instance with authentication
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
            this.dln.bowl.AddHook((m) => {
                var _a;
                (_a = this.wss) === null || _a === void 0 ? void 0 : _a.clients.forEach((e, i) => {
                    e.send(JSON.stringify({
                        type: "content",
                        message: m
                    }, null, 3));
                });
            });
            this.dln.logger.logHook((m) => {
                var _a;
                //console.log(`monitor log hook`)
                (_a = this.wss) === null || _a === void 0 ? void 0 : _a.clients.forEach((e, i) => {
                    e.send(JSON.stringify({
                        type: "log",
                        message: `${m}`
                    }, null, 3));
                });
            });
            /*this.dln.contentHook((m) => {
                this.wss?.clients.forEach((e, i) => {
                    e.send(JSON.stringify({
                        type: "content",
                        message: m
                    }))
                })
            })
            this.dln.logHook((m) => {
                //console.log(`monitor log hook`)
                this.wss?.clients.forEach((e, i) => {
                    e.send(JSON.stringify({
                        type: "log",
                        message: m
                    }))
                })
            })*/
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
