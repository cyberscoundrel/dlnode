"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DLayerNode = void 0;
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const portfinder_1 = __importDefault(require("portfinder"));
const express_ws_1 = __importDefault(require("express-ws"));
const ws_1 = __importDefault(require("ws"));
const zod_1 = require("zod");
const zodschemas_1 = require("./zodschemas");
const dlbuilder_1 = require("./dlbuilder");
class DLayerNode {
    //contentReadable: stream.Readable = new stream.Readable()
    contentHit(hash) {
        return this.contentMap.has(hash);
    }
    hash(cont) {
        let sha = crypto_1.default.createHash('sha256');
        sha.update('' + cont);
        return sha.digest('hex');
    }
    filterSend(rb, context, rules) {
        if (true) {
            let pre = rb._generateNoValidate();
            let outbound = rb.generate();
            this.logger(`sending message back to ${context.socket}: ${JSON.stringify(outbound, null, 2)}`);
            this.logger(`from ${JSON.stringify(pre)}`);
            if (!(outbound.type === dlbuilder_1.QueryCodes.nosend || (outbound.res && (outbound.res.status == dlbuilder_1.ResponseCodes.nosend || outbound.res.status == dlbuilder_1.ResponseCodes.error)))) {
                this.logger(`message sent`);
                //generate before conditional
                context.reply(JSON.stringify(outbound));
            }
            else {
                this.logger(`message caught`);
            }
        }
    }
    handleDLNodeError(err, rb) {
        //log or pass build or decide what errors to nosend
        err.buildError(rb);
    }
    resolveTicket(message, context) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            let rb = new dlbuilder_1.DLQueryBuilder();
            let rbb = new dlbuilder_1.DLQueryBuilder();
            if (message.ticket.recipient) {
                if (this.tickets.has(message.ticket.recipient)) {
                    if ((_a = this.tickets.get(message.ticket.recipient)) === null || _a === void 0 ? void 0 : _a.has(message.ticket.txn)) {
                        rb.DLNoSend("ticket resolved");
                        (_c = (_b = this.resolved.get(message.ticket.recipient)) === null || _b === void 0 ? void 0 : _b.get(message.ticket.txn)) === null || _c === void 0 ? void 0 : _c.push(Object.assign(Object.assign({}, this.tickets.get(message.ticket.recipient).get(message.ticket.txn)), { response: message.res }));
                        let newReq = Object.assign({}, this.tickets.get(message.ticket.recipient).get(message.ticket.txn).request);
                        newReq.hops -= 1;
                        rbb.from(message).setTicket(this.tickets.get(message.ticket.recipient).get(message.ticket.txn).ticket).setReq(newReq);
                        this.filterSend(rbb, {
                            reply: this.sockets.get(message.ticket.recipient)
                        });
                        this.filterSend(rb, context);
                    }
                    else {
                        throw new dlbuilder_1.DLQueryBuilderError("txn does not exist for recipient", "txn does not exist for recipient", dlbuilder_1.ErrorCodes.invalidResponse, context, message.ticket);
                    }
                }
                else {
                    throw new dlbuilder_1.DLQueryBuilderError("invalid recipient", "invalid recipient", dlbuilder_1.ErrorCodes.invalidResponse, context, message.ticket);
                }
            }
            else {
                throw new dlbuilder_1.DLQueryBuilderError("no recipient provided", "no recipient provided", dlbuilder_1.ErrorCodes.invalidResponse, context, message.ticket);
            }
        });
    }
    resolveResponse(message, rb, context) {
        let ticket = message.ticket;
        this.logger(`resolve response`);
        switch (message.res.status) {
            case dlbuilder_1.ResponseCodes.hit:
                this.resolveTicket(message, context).catch((err) => {
                    if (err instanceof dlbuilder_1.DLNodeErrorBase) {
                        let rbb = new dlbuilder_1.DLQueryBuilder();
                        this.handleDLNodeError(err, rbb);
                        this.filterSend(rbb, context);
                    }
                });
                rb.DLNoSend(`received hit from peer`);
                break;
            default:
                this.logger(`received response from ${context.socket}: ${JSON.stringify(message, null, 2)}`);
        }
    }
    resolveError(message, rb, context) {
    }
    resolveDisconnect(id) {
    }
    resolveRequest(message, rb, context) {
        //console.log(`received request ${JSON.stringify(message)}`)
        this.logger(`received request ${JSON.stringify(message)}`);
        rb.setType(dlbuilder_1.QueryCodes.response);
        if (this.contentHit(message.req.contentHash.hash)) {
            this.logger(`content hit: ${this.contentMap.get(message.req.contentHash.hash)}`);
            rb.setRes({
                status: dlbuilder_1.ResponseCodes.hit,
                content: [{
                        content: this.maps[message.type].get((message.req.contentHash.hash))
                    }]
            }).setMessage({}).setReq(message.req);
            this.logger(`rb ${JSON.stringify(rb._generateNoValidate(), null, 3)}`);
        }
        else {
            this.logger(`no hit, peer query`);
            this.queryPeers(message, this.createTicket(message, rb, context), context).catch((err) => {
                if (err instanceof dlbuilder_1.DLNodeErrorBase) {
                    let rbb = new dlbuilder_1.DLQueryBuilder();
                    this.handleDLNodeError(err, rbb);
                    this.filterSend(rbb, context);
                }
            });
        }
    }
    dlayer(req, rb, context) {
        var _a, _b;
        //console.log(`dlayer ${req}`)
        this.logger(`dlayer ${JSON.stringify(req, null, 2)}`);
        dlbuilder_1.DLQueryBuilder.validate(req);
        //console.log(`validated request`)
        this.logger(`validated request`);
        rb.setTicket(req.ticket);
        switch (req.type) {
            case dlbuilder_1.QueryCodes.request:
                if (((_a = req.req) === null || _a === void 0 ? void 0 : _a.hops) && req.req.hops < 3) {
                    this.resolveRequest(req, rb, context);
                }
                else {
                    this.logger(`overhopped`);
                    rb.DLNoSend();
                }
                break;
            case dlbuilder_1.QueryCodes.response:
                if (((_b = req.req) === null || _b === void 0 ? void 0 : _b.hops) && req.req.hops > 0) {
                    this.resolveResponse(req, rb, context);
                }
                else {
                    this.logger(`overhopped`);
                    rb.DLNoSend();
                }
                break;
        }
        //return rb.generate()
        //hash of enpoint code on blockchain
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    queryPeers(req, newTicket, context) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            this.logger(`querying peers for query ${JSON.stringify(req, null, 2)}`);
            //let data = undefined
            yield this.sleep(1000);
            this.logger(`querying peers for socket ${context.socket}:`);
            this.logger(`original query req ${JSON.stringify(req.req, null, 2)}`);
            let qb = new dlbuilder_1.DLQueryBuilder();
            let newReq = {
                contentHash: (_a = req.req) === null || _a === void 0 ? void 0 : _a.contentHash,
                hops: ((_b = req.req) === null || _b === void 0 ? void 0 : _b.hops) + 1
            };
            qb.from(req).setTicket(newTicket).setReq(newReq);
            let generated = qb.generate();
            this.sockets.forEach((v, k) => {
                if (k !== context.socket) {
                    v(JSON.stringify(generated));
                }
            });
        });
    }
    createTicket(req, rb, context) {
        var _a;
        //console.log(`ticket creation for ${JSON.stringify(req)}`)
        this.logger(`ticket creation for ${JSON.stringify(req, null, 2)}`);
        if (context.socket) {
            let hsh1 = context.socket;
            if (req.req) {
                let newReq = Object.assign({}, req.req);
                newReq.hops = 0;
                let hsh0 = this.hash(newReq);
                newReq.hops = req.req.hops;
                if (this.sockets.has(hsh1) && this.tickets.has(hsh1) && this.resolved.has(hsh1)) {
                    if (this.sockets.get(hsh1) && this.tickets.get(hsh1) && this.resolved.get(hsh1)) {
                        //create ticket
                        (_a = this.tickets.get(hsh1)) === null || _a === void 0 ? void 0 : _a.set(hsh0, {
                            request: newReq,
                            ticket: {
                                txn: hsh0,
                                recipient: hsh1
                            }
                        });
                        rb.setRes({
                            status: dlbuilder_1.ResponseCodes.ticket
                        }).setMessage({
                            text: "ticket created"
                        }).setType(dlbuilder_1.QueryCodes.response).setReq(newReq);
                        return {
                            txn: hsh0,
                            recipient: hsh1
                        };
                    }
                    else {
                        throw new dlbuilder_1.DLInternalError("could not create ticket: ticket caches or socket entry not instantiated", "could not create ticket: ticket caches or socket entry not instantiated", dlbuilder_1.InternalError.ticketCreation);
                    }
                }
                else {
                    throw new dlbuilder_1.DLInternalError("could not create ticket: ticket caches or socket entry do not exist", "could not create ticket: ticket caches or socket entry do not exist", dlbuilder_1.InternalError.ticketCreation);
                }
            }
            else {
                throw new dlbuilder_1.DLInternalError("could not create ticket: request does not contain req object", "could not create ticket: request does not contain req object", dlbuilder_1.InternalError.ticketCreation);
            }
        }
        else {
            throw new dlbuilder_1.DLInternalError("could not create ticket: context socket not provided", "could not create ticket: context socket not provided", dlbuilder_1.InternalError.ticketCreation);
        }
    }
    getStat() {
        const data = Object.assign({}, this);
        return data;
        /*return {
            peers: this.peers,
        }*/
    }
    initWS(ws, remoteAddress) {
        //console.log(`initializing socket with url ${remoteAddress}`)
        this.logger(`initializing socket with url ${remoteAddress}`);
        ws.on('message', (msg) => {
            let qb = new dlbuilder_1.DLQueryBuilder();
            let context = {
                reply: (m) => ws.send(m),
                socket: this.hash(remoteAddress)
            };
            try {
                //console.log(`received message ${msg}`)
                this.logger(`received message from ${remoteAddress}: ${msg.toString()}`);
                let dmsg = zodschemas_1.DLQueryZ.parse(JSON.parse(msg.toString()));
                //console.log(dmsg)
                //this.logger(dmsg)
                this.dlayer(dmsg, qb, context);
            }
            catch (err) {
                //console.log(`error in dlayer ${err}`)
                this.logger(`error in dlayer ${err}`);
                if (err instanceof dlbuilder_1.DLQueryBuilderError) {
                    //console.log(`querybuilder error`)
                    this.logger(`querybuilder error`);
                    this.handleDLNodeError(err, qb);
                }
                else if (err instanceof zod_1.ZodError) {
                    //console.log(`zod error`)
                    this.logger(`zod error`);
                    qb.DLError(dlbuilder_1.ErrorCodes.internalError, "zod validation error: message does not meet schema requirements", dlbuilder_1.DLQueryBuilder.NoTicket);
                }
            }
            this.logger(`end of dlayer`);
            this.filterSend(qb, context);
        });
        ws.on('close', () => {
            //console.log(`${ws.url} disconnected`)
            this.logger(`${ws.url} disconnected`);
            this.socketTearDown(ws.url);
        });
        return ws;
    }
    socketSetUp(url, ws) {
        let hsh = this.hash(url);
        this.sockets.set(hsh, (m) => {
            ws.send(m);
        });
        this.tickets.set(hsh, new Map());
        this.resolved.set(hsh, new Map());
    }
    socketTearDown(url) {
        let hsh = this.hash(url);
        this.sockets.delete(hsh);
        this.tickets.delete(hsh);
        this.resolved.delete(hsh);
    }
    updateSessions() {
        this.peers.forEach((e, i) => {
            let hsh = this.hash(e);
            if (!this.sockets.has(hsh)) {
                let ws = this.initWS(new ws_1.default(e), e);
                this.socketSetUp(e, ws); /*giving advice is so easy and vicariously satisfies the desire to resolve your own failings*/
            }
        });
        this.appInst.getWss().clients.forEach((client) => {
            this.socketSetUp(client.url, client);
        });
    }
    listen(start) {
        portfinder_1.default.setBasePort(start);
        return portfinder_1.default.getPortPromise().then((p) => {
            this.port = p;
            console.log(`start port ${start} claim port ${p}`);
            this.app.listen(p, () => {
                //console.log(`DLayer listening on port ${this.port}`)
                this.logger(`DLayer listening on port ${this.port}`);
            });
            return p;
        });
        //if port is used, use next and return port
    }
    deploy() {
        //this.peers
        return this.listen(this.port).then((e) => {
            console.log(`port after listen ${e}`);
            let shsh = this.hash(this.secret);
            this.sockets.set(shsh, (m) => {
                this.onContent(m);
                //this.content += m
            });
            this.tickets.set(shsh, new Map());
            this.resolved.set(shsh, new Map());
            return e;
        });
    }
    requestContent(contentHash) {
        var _a;
        this.logger(`request for content hash ${contentHash}`);
        let rb = new dlbuilder_1.DLQueryBuilder();
        let newRequest = {
            contentHash: {
                hash: contentHash
            },
            hops: 0
        };
        let newTicket = {
            recipient: this.hash(this.secret),
            txn: this.hash(newRequest)
        };
        rb.setType(dlbuilder_1.QueryCodes.request).setReq(newRequest).setMessage({}).setTicket(newTicket);
        (_a = this.tickets.get(this.hash(this.secret))) === null || _a === void 0 ? void 0 : _a.set(this.hash(newRequest), {
            request: newRequest,
            ticket: newTicket
        });
        this.queryPeers(rb.generate(), newTicket, {
            reply: this.sockets.get(this.hash(this.secret))
        });
    }
    addPeer(peer) {
        this.peers.push(peer);
        this.updateSessions();
    }
    addPeers(peers) {
        peers.forEach((e, i) => {
            this.peers.push(e);
        });
        this.updateSessions();
    }
    addRawContent(content) {
        this.contentMap.set(this.hash(content), content);
    }
    bootstrapPeers() {
        this.bootstraps.forEach((e, i) => {
            let ax = axios_1.default.create({
                baseURL: `https://${e}`,
                timeout: 1000
            });
            ax.get('/bootstrap').then((res) => {
                res.data.peers.forEach((e, i) => {
                    //this.peers.push(e)
                });
            });
            this.peers.push(e);
        });
        //this.updateSessions()
    }
    logger(m) {
        this.logHooks.forEach((e, i) => {
            //console.log(`calling log hook ${i}`)
            e(`[localhost:${this.port}]  ` + m);
        });
    }
    logHook(hook) {
        this.logHooks.push(hook);
    }
    onContent(m) {
        this.contentHooks.forEach((e, i) => {
            e(`[localhost:${this.port}]  ` + m);
        });
    }
    contentHook(hook) {
        this.contentHooks.push(hook);
    }
    constructor(port, secret = "secret", peers = [], bootstraps = []) {
        this.isDeployed = false;
        this.functionMap = new Map();
        this.contentMap = new Map();
        this.endpointMap = new Map();
        this.maps = [this.contentMap, this.functionMap, this.endpointMap];
        this.peers = [];
        this.eat = false;
        this.logHooks = [];
        this.contentHooks = [];
        //sha: crypto.Hash = crypto.createHash('sha256')
        this.log = "";
        //logReadable: stream.Readable = new stream.Readable()
        this.content = "";
        this.tickets = new Map();
        this.resolved = new Map();
        this.secret = secret;
        this.port = port;
        this.appInst = (0, express_ws_1.default)((0, express_1.default)());
        this.app = this.appInst.app;
        this.peers = peers;
        this.sockets = new Map();
        this.bootstraps = bootstraps;
        this.bootstrapPeers();
        this.logHook((m) => {
            this.log += m;
            console.log(m);
        });
        this.contentHook((m) => {
            this.content += m;
        });
        this.app.ws('/', (ws, req) => {
            if (req.socket.remoteAddress) {
                this.peers.push(`ws://${req.socket.remoteAddress}:${req.socket.remotePort}`);
            }
            this.logger(`connection from ${req.socket.remoteAddress}:${req.socket.remotePort}`);
            //console.log(`connection from ${req.socket.remoteAddress}:${req.socket.remotePort}`)
            this.socketSetUp(`ws://${req.socket.remoteAddress}:${req.socket.remotePort}`, this.initWS(ws, `ws://${req.socket.remoteAddress}:${req.socket.remotePort}`));
        });
        this.app.get('/bootstrap', (req, res) => {
            res.send(this.peers);
        });
    }
}
exports.DLayerNode = DLayerNode;
