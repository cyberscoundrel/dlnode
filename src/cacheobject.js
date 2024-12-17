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
Object.defineProperty(exports, "__esModule", { value: true });
exports.IEndpoint = exports.RawContent = exports.IContent = exports.LocalPeer = exports.WSPeer = exports.IPeer = exports.ICacheObject = exports.PeerDirection = void 0;
const protocol_1 = require("./protocol");
const dlbuilder_1 = require("./dlbuilder");
const logger_1 = require("./logger");
var PeerDirection;
(function (PeerDirection) {
    PeerDirection[PeerDirection["bidirectional"] = 0] = "bidirectional";
    PeerDirection[PeerDirection["reciever"] = 1] = "reciever";
})(PeerDirection || (exports.PeerDirection = PeerDirection = {}));
class ICacheObject {
    GetKeyFields() {
        return Object.assign({}, this._fields);
    }
    GetFields() {
        return this._fields;
    }
    //must be unique
    TransformToKey() {
        return this._cache.GetHashAlg().Hash(JSON.stringify(this.GetKeyFields()));
    }
    MatchKeyFields(object, overlap) {
        const objectKeys = Object.keys(object);
        const fieldKeys = Object.keys(this._fields);
        if (overlap) {
            return fieldKeys.some((key) => objectKeys.includes(key));
        }
        else {
            return fieldKeys.every((key) => objectKeys.includes(key));
        }
    }
    constructor() {
    }
}
exports.ICacheObject = ICacheObject;
class IPeer extends ICacheObject {
    TransformToKey() {
        return this._cache.GetHashAlg().Hash(this._fields.host);
    }
    GetProtocol() {
        return this._protocol;
    }
    GetLogger() {
        return this._peerLogger;
    }
    TransformToIndex() {
        return this.TransformToKey();
    }
    Init() {
        this._protocol.InitPeer(this);
    }
    SetSend(send) {
        this.send = send;
    }
    SetDirection(dir) {
        this._fields.direction = dir;
    }
    SetActive(active) {
        this._fields.active = active;
    }
    Deactivate() {
        this.SetActive(false);
    }
    GetHost() {
        return this._fields.host;
    }
    _filterSend(rb, rules) {
        if (true) {
            let pre = rb._generateNoValidate();
            let outbound = rb.generate();
            this._cache.GetLogger().log(`sending message back to ${this.TransformToKey()}/${this._fields.host}: ${JSON.stringify(outbound, null, 2)}`);
            this._cache.GetLogger().log(`from ${JSON.stringify(pre)}`);
            if (!(outbound.type === dlbuilder_1.QueryCodes.nosend ||
                (outbound.res &&
                    (outbound.res.status ==
                        dlbuilder_1.ResponseCodes.nosend ||
                        outbound.res.status == dlbuilder_1.ResponseCodes.error)))) {
                this._cache.GetLogger().log(`message sent`);
                //generate before conditional
                if (this.send) {
                    this.GetLogger().log(`outbound message`);
                    this.send(outbound);
                }
            }
            else {
                this._cache.GetLogger().log(`message caught`);
            }
        }
    }
    Send(m) {
        this._filterSend(m);
    }
    constructor(cache, protocol, host, dir = PeerDirection.bidirectional, active = true) {
        super();
        this._cache = cache;
        this._protocol = protocol;
        this._fields = {
            host: host,
            active: active,
            direction: dir
        };
        this._peerLogger = new logger_1.PeerLogger(this, this._cache.GetLogger());
    }
}
exports.IPeer = IPeer;
class WSPeer extends IPeer {
    constructor(dln, cache, ws, remote = ws.url) {
        super(cache, new protocol_1.WSProtocol(dln.logger), remote);
        this._ws = ws;
        this._dln = dln;
    }
}
exports.WSPeer = WSPeer;
class LocalPeer extends IPeer {
    constructor(dln, cache, name, hooks = [
        (m) => {
            this._content += m;
        },
        (m) => {
            console.log(m);
        }
    ]) {
        super(cache, new protocol_1.LocalProtocol(dln.logger), name, PeerDirection.reciever);
        this._content = "";
        this._localPeerHooks = hooks;
        this._dln = dln;
    }
    CreateRequest(cHash, hops) {
        return __awaiter(this, void 0, void 0, function* () {
            let qb = new dlbuilder_1.DLQueryBuilder();
            let newTicket = this._dln.ticketCache.CreateTicket(this, {
                contentHash: {
                    hash: cHash
                },
                hops: hops
            }, dlbuilder_1.DLQueryBuilder.NoTicket, qb);
            this.GetLogger().log(`creating ticket ${JSON.stringify({
                ticket: newTicket.GetTicket(),
                request: newTicket.GetRequest(),
                rhash: this._cache.GetHashAlg().Hash(newTicket.GetRequest()),
                peer: this.GetHost()
            }, null, 2)}`);
            return qb.setReq({
                contentHash: {
                    hash: cHash
                },
                hops: hops
            }).setMessage({}).setTicket(newTicket.GetTicket()).setType(dlbuilder_1.QueryCodes.request);
        });
    }
    RequestContent(cHash, hops) {
        this.CreateRequest(cHash, hops).then((qb) => {
            this._cache.QueryPeers(this, qb);
        });
    }
    //hook for received messages
    //hook for delivered messages
    AddHook(hook) {
        this._localPeerHooks.push(hook);
    }
    RunHooks(m) {
        this._localPeerHooks.forEach((e, i) => {
            e(m);
        });
    }
}
exports.LocalPeer = LocalPeer;
class IContent extends ICacheObject {
    TransformToKey() {
        return this._cache.GetHashAlg().Hash(this._fields.raw);
    }
    constructor(cache, type, raw) {
        super();
        this._cache = cache;
        this._fields = {
            type: type,
            raw: raw
        };
    }
}
exports.IContent = IContent;
class RawContent extends IContent {
    GenerateResponse() {
        return {
            status: dlbuilder_1.ResponseCodes.hit,
            content: [{
                    content: this._fields.raw
                }]
        };
    }
    FromResponse(response) {
        return new RawContent(this._cache, 'raw', response.content[0].content);
    }
}
exports.RawContent = RawContent;
class IEndpoint extends ICacheObject {
    TransformToKey() {
        return this._fields.publicKey;
    }
    constructor(cache, host, endpoint, pk) {
        super();
        this._fields = {
            host: host,
            endpoint: endpoint,
            publicKey: pk,
        };
    }
}
exports.IEndpoint = IEndpoint;
