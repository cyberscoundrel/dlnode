"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DLayerNode = void 0;
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const portfinder_1 = __importDefault(require("portfinder"));
const express_ws_1 = __importDefault(require("express-ws"));
const ws_1 = __importDefault(require("ws"));
const dlbuilder_1 = require("./dlbuilder");
const stream_1 = require("stream");
const cache_1 = require("./cache");
const cacheobject_1 = require("./cacheobject");
const hmcache_1 = require("./hmcache");
const logger_1 = require("./logger");
const hasher_1 = require("./hasher");
class DLayerNode extends stream_1.EventEmitter {
    connectWS(urls) {
        urls.forEach((url, i) => {
            let wspeer = new cacheobject_1.WSPeer(this, this.peerCache, new ws_1.default(url), url);
            this.peerCache.Connect(wspeer);
        });
    }
    handleDLNodeError(err, rb) {
        //log or pass build or decide what errors to nosend
        err.buildError(rb);
    }
    resolveResponse(message, rb, peer) {
        //let ticket = message.ticket
        this.logger.log(`resolve response`);
        switch (message.res.status) {
            case dlbuilder_1.ResponseCodes.hit:
                this.ticketCache.ResolveTicket(message.ticket, message.res, peer).catch((err) => {
                    if (err instanceof dlbuilder_1.DLNodeErrorBase) {
                        let rbb = new dlbuilder_1.DLQueryBuilder();
                        this.handleDLNodeError(err, rbb);
                        peer.Send(rbb);
                    }
                });
                rb.DLNoSend(`received hit from peer`);
                break;
            default:
                this.logger.log(`received response from ${peer.GetHost()}: ${JSON.stringify(message, null, 2)}`);
        }
    }
    resolveError(message, rb, context) {
    }
    resolveContentRequest(message, rb, peer) {
        //console.log(`received request ${JSON.stringify(message)}`)
        this.logger.log(`received request ${JSON.stringify(message)}`);
        rb.setType(dlbuilder_1.QueryCodes.response).setReq(message.req).setRes({ status: dlbuilder_1.ResponseCodes.info }).setMessage({
            text: "received request"
        }).setTicket(dlbuilder_1.DLQueryBuilder.NoTicket);
        peer.Send(rb);
        this.contentCache.HasId(message.req.contentHash.hash).then((e) => {
            if (e) {
                this.logger.log(`content hit: ${this.contentCache.Get([message.req.contentHash.hash])}`);
                this.contentCache.Get([message.req.contentHash.hash]).then((e) => {
                    let rbb = new dlbuilder_1.DLQueryBuilder();
                    rbb.setRes(e[0].GenerateResponse()).setMessage({}).setReq(message.req).setTicket(message.ticket);
                    this.logger.log(`rbb ${JSON.stringify(rbb._generateNoValidate(), null, 3)}`);
                    peer.Send(rbb);
                });
            }
            else {
                this.logger.log(`no hit, peer query`);
                try {
                    this.ticketCache.CreateTicket(peer, message.req, message.ticket, rb, (e) => {
                        this.logger.log(`ticket created ${JSON.stringify(e, null, 2)}`);
                        let qbb = new dlbuilder_1.DLQueryBuilder().from(message).setTicket(e.Get());
                        this.peerCache.QueryPeers(peer, qbb).catch((err) => {
                            if (err instanceof dlbuilder_1.DLNodeErrorBase) {
                                let rbb = new dlbuilder_1.DLQueryBuilder();
                                this.handleDLNodeError(err, rbb);
                                peer.Send(rbb);
                            }
                        });
                    });
                }
                catch (err) {
                    if (err instanceof dlbuilder_1.DLNodeErrorBase) {
                        let rbb = new dlbuilder_1.DLQueryBuilder();
                        this.handleDLNodeError(err, rbb);
                        peer.Send(rbb);
                    }
                }
            }
        });
    }
    dlayer(req, rb, peer) {
        var _a, _b, _c, _d;
        this.logger.log(`dlayer ${JSON.stringify(req, null, 2)}`);
        dlbuilder_1.DLQueryBuilder.validate(req);
        this.logger.log(`validated request`);
        rb.setTicket(req.ticket);
        switch (req.type) {
            case dlbuilder_1.QueryCodes.request:
                if (((_a = req.req) === null || _a === void 0 ? void 0 : _a.hops) && req.req.hops < 3) {
                    this.resolveContentRequest(req, rb, peer);
                }
                else {
                    this.logger.log(`overhopped ${((_b = req.req) === null || _b === void 0 ? void 0 : _b.hops) != undefined ? 'true' : 'false'} && ${req.req.hops < 3 ? 'true' : 'false'}`);
                    rb.DLNoSend();
                }
                break;
            case dlbuilder_1.QueryCodes.response:
                if (((_c = req.req) === null || _c === void 0 ? void 0 : _c.hops) != undefined && req.req.hops > -1) {
                    this.logger.log(`pls resolve response`);
                    this.resolveResponse(req, rb, peer);
                }
                else {
                    this.logger.log(`overhopped ${((_d = req.req) === null || _d === void 0 ? void 0 : _d.hops) != undefined ? 'true' : 'false'} && ${req.req.hops > -1 ? 'true' : 'false'}`);
                    rb.DLNoSend();
                }
                break;
        }
    }
    getStat() {
        const data = {
            contentCache: [...this.contentCache._accessor._cacheObjectHM.entries()].map((e, i) => {
                return {
                    key: e[0],
                    value: e[1]._fields.raw
                };
            }),
            peerCache: [...this.peerCache._accessor._cacheObjectHM.entries()].map((e, i) => {
                return {
                    key: e[0],
                    value: e[1]._fields.host
                };
            }),
            ticketCache: [...this.ticketCache._accessor._cacheObjectHM.entries()].map((e, i) => {
                return {
                    key: e[0],
                    value: e[1]._fields._ticket
                };
            }),
            port: this.port,
            secret: this.secret,
            log: this.logger._log,
            content: this.bowl._content
        };
        return data;
    }
    listen(start) {
        portfinder_1.default.setBasePort(start);
        return portfinder_1.default.getPortPromise().then((p) => {
            this.port = p;
            console.log(`start port ${start} claim port ${p}`);
            this.app.listen(p, () => {
                this.logger.log(`DLayer listening on port ${this.port}`);
            });
            return p;
        });
        //if port is used, use next and return port
    }
    deploy() {
        return this.listen(this.port).then((e) => {
            console.log(`port after listen ${e}`);
            this.peerCache.Connect(this.bowl);
            return e;
        });
    }
    bootstrapPeers() {
        this.bootstraps.forEach((e, i) => {
            let ax = axios_1.default.create({
                baseURL: `https://${e}`,
                timeout: 1000
            });
            ax.get('/bootstrap').then((res) => {
                res.data.peers.forEach((e0, i0) => {
                    this.peerCache.Connect(new cacheobject_1.WSPeer(this, this.peerCache, new ws_1.default(`ws://${e0}`), `ws://${e0}`));
                });
            });
            this.peerCache.Connect(new cacheobject_1.WSPeer(this, this.peerCache, new ws_1.default(`ws://${e}`), `ws://${e}`));
        });
    }
    constructor(port, secret = "secret", peers = [], bootstraps = []) {
        super();
        this.isDeployed = false;
        this.functionMap = new Map();
        this.logger = new logger_1.DLNLogger(this);
        this.hasher = hasher_1.HasherSHA256.GetInstance();
        this.contentCache = new cache_1.IContentCache(this.logger, new hmcache_1.HMCache());
        this.endpointCache = new cache_1.IEndpointCache(this.logger, new hmcache_1.HMCache());
        this.peerCache = new cache_1.IPeerCache(this.logger, new hmcache_1.HMCache());
        this.ticketCache = new cache_1.ITicketCache(this.peerCache, this.logger, new hmcache_1.HMCache());
        this.outboundAddressIPV6 = "";
        this.eat = false;
        this.secret = secret;
        this.port = port;
        this.appInst = (0, express_ws_1.default)((0, express_1.default)());
        this.app = this.appInst.app;
        this.bootstraps = bootstraps;
        this.bootstrapPeers();
        this.bowl = new cacheobject_1.LocalPeer(this, this.peerCache, this.secret);
        this.app.ws('/', (ws, req) => {
            let newPeer = new cacheobject_1.WSPeer(this, this.peerCache, ws, `ws://${req.socket.remoteAddress}:${req.socket.remotePort}`);
            if (req.socket.remoteAddress) {
                this.peerCache.Connect(newPeer);
            }
            this.logger.log(`connection from ${req.socket.remoteAddress}:${req.socket.remotePort}`);
        }); //create dl clearnet resolver
        this.app.ws('/test', (ws, req) => {
            ws.on('message', (data) => {
                this.logger.log('test endpoint');
            });
        });
        this.app.get('/bootstrap', (req, res) => {
            this.peerCache.GetAll().then((m) => {
                let peers = m.map((e, i) => {
                    return e._fields.host;
                });
                res.send(peers);
            });
        });
    }
}
exports.DLayerNode = DLayerNode;
