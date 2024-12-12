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
exports.ITicketCache = exports.IEndpointCache = exports.IContentCache = exports.IPeerCache = exports.ICache = exports.CacheAccessor = void 0;
const events_1 = __importDefault(require("events"));
const dlbuilder_1 = require("./dlbuilder");
const cacheobject_1 = require("./cacheobject");
const hasher_1 = require("./hasher");
const queryobjects_1 = require("./queryobjects");
class CacheAccessor {
    _getn(elms) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    _getIds(elmIds) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    _removeIds(elmIds) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    _removen(elms) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    //create payment broker and exchange field in response type
    //send wallet in request
    //send accepted agreement to server, server creates receipts/vouchers that get bulk processed by smart contracts on block chain
    _add(key, elm) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    _iterate(cb) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    _has(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    _hasId(key) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
}
exports.CacheAccessor = CacheAccessor;
class ICache extends events_1.default {
    GetLogger() {
        return this._logger;
    }
    /*_getn(elms: Record<string, unknown>[]): T[] {
        throw new Error("Method not implemented.");
    }
    _getIds(elmIds: unknown[]): T[] {
        throw new Error("Method not implemented.");
    }
    _removeIds(elmIds: unknown[]): void {
        throw new Error("Method not implemented.");
    }
    _removen(elms: Record<string, unknown>[]): void {
        throw new Error("Method not implemented.");
    }
    //create payment broker and exchange field in response type
    //send wallet in request
    //send accepted agreement to server, server creates receipts/vouchers that get bulk processed by smart contracts on block chain
    _add(key: unknown, elm: ICacheObject): void {
        throw new Error("Method not implemented.");
    }
    _iterate(cb?: (t: T) => {}): Promise<void> {
        throw new Error("Method not implemented.");
    }
    _has(obj: Record<string, unknown>): boolean {
        throw new Error("Method not implemented.");
    }*/
    _preRefresh() {
    }
    _postRefresh() {
    }
    GetHashAlg() {
        return this._hasher;
    }
    Get(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._accessor._getIds(keys);
        });
    }
    GetAll() {
        return __awaiter(this, void 0, void 0, function* () {
            let gatheredElms = [];
            yield this._accessor._iterate((v) => {
                gatheredElms.push(v);
            });
            return gatheredElms;
        });
    }
    Find(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._accessor._getn(keys);
        });
    }
    RemoveIds(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            let removedElements = this._accessor._getIds(keys);
            this._accessor._removeIds(keys);
            this.emit('removal', removedElements);
            return;
        });
    }
    RemoveN(keys) {
        return __awaiter(this, void 0, void 0, function* () {
            let removedElements = this._accessor._getn(keys);
            this._accessor._removen(keys);
            this.emit('removal', removedElements);
            return;
        });
    }
    Refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            this._preRefresh();
            yield this._accessor._iterate();
            this.emit('refresh');
            this._postRefresh();
        });
    }
    Has(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._accessor._has(obj);
        });
    }
    HasId(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._accessor._hasId(key);
        });
    }
    constructor(logger, hasher = hasher_1.HasherSHA256.GetInstance(), accessor) {
        super();
        this._hasher = hasher;
        this._logger = logger;
        this._accessor = accessor;
    }
}
exports.ICache = ICache;
class IPeerCache extends ICache {
    _sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    _queryPeers(origin, qb) {
        return __awaiter(this, void 0, void 0, function* () {
            (`querying peers for query ${JSON.stringify(qb.getReq(), null, 2)}`);
            //let data = undefined
            yield this._sleep(1000);
            this.GetLogger().log(`querying peers for socket ${origin.TransformToKey()}/${origin._fields.host}:`);
            this.GetLogger().log(`original query req ${JSON.stringify(qb.getReq(), null, 2)}`);
            //let qb = new DLQueryBuilder()
            let newReq = (Object.assign({}, qb.getReq()));
            newReq.hops += 1;
            qb.setReq(newReq);
            //let generated = qb.generate()
            this._activeConnectionPool.forEach((v, k) => {
                if (v._fields.active && v._fields.direction == cacheobject_1.PeerDirection.bidirectional) {
                    v.Send(qb);
                }
            });
        });
    }
    QueryPeers(origin, qb) {
        return __awaiter(this, void 0, void 0, function* () {
            this._queryPeers(origin, qb);
            //queries only active peers
        });
    }
    Connect(arg) {
        this._accessor._add(arg.TransformToKey(), arg);
        this._activeConnectionPool.set(arg.TransformToKey(), arg);
        arg.Init();
        //_add()
        //this logic only directly manages the active connection pool
        //connection logic
    }
    Disconnect(peers) {
        //_removeIds()
        //this logic only directly manages the active connection pool
        //disconnection logic
    }
    Pair(ticketCache) {
        this._ticketCache = ticketCache;
        ticketCache.SetPeerCache(this);
    }
    _getTicketCache() {
        return this._ticketCache;
    }
    constructor(logger, accessor) {
        super(logger, undefined, accessor);
        this._activeConnectionPool = new Map();
        this.addListener('disconnect', () => {
        });
    }
}
exports.IPeerCache = IPeerCache;
/*export type HMPeerCache = Omit<IPeerCache, keyof HMCache<IPeer<IProtocol<any>>>> & HMCache<IPeer<IProtocol<any>>>*/
class IContentCache extends ICache {
    IndexContent(args) {
        this._accessor._add(args.TransformToKey(), args);
    }
    DeIndexContent(arg) {
    }
    AddRawContent(cont) {
        let c = new cacheobject_1.RawContent(this, 'raw', cont);
        this.IndexContent(c);
        return c;
    }
    constructor(logger, accessor) {
        super(logger, undefined, accessor);
    }
}
exports.IContentCache = IContentCache;
/*export type _HMContentCache = Omit<IContentCache, keyof HMCache<IContent>> & HMCache<IContent>
export class HMContentCache extends _HMContentCache {
    
}*/
class IEndpointCache extends ICache {
    IndexEndpoint(args) {
    }
    DeIndexEndpoint(arg) {
    }
    constructor(logger, accessor) {
        super(logger, undefined, accessor);
    }
}
exports.IEndpointCache = IEndpointCache;
//export type HMEndpointCache = Omit<IEndpointCache, keyof HMCache<IEndpoint>> & HMCache<IEndpoint>
class ITicketCache extends ICache {
    //_response: Map<string, DLResponse[]> = new Map()
    SetPeerCache(pc) {
        this._peerCache = pc;
    }
    GetPeerCache() {
        return this._peerCache;
    }
    _createTicket(req, tc, rb, peer) {
        return __awaiter(this, void 0, void 0, function* () {
            //console.log(`ticket creation for ${JSON.stringify(req)}`)
            let rbbb = new dlbuilder_1.DLQueryBuilder();
            rbbb.from(rb._generateNoValidate());
            this._logger.log(`ticket creation for ${JSON.stringify(req, null, 2)}`);
            if (peer.TransformToKey()) {
                //let hsh1 = peer.TransformToKey()
                if (req) {
                    //let hsh0 = this.GetHashAlg().Hash(newReq)
                    this._accessor._add(tc.TransformToKey(), tc);
                    rbbb.setRes({
                        status: dlbuilder_1.ResponseCodes.ticket
                    }).setMessage({
                        text: "ticket created"
                    }).setType(dlbuilder_1.QueryCodes.response).setReq(req);
                    peer.Send(rbbb);
                    return tc;
                    /*if(this.sockets.has(hsh1) && this.tickets.has(hsh1) && this.resolved.has(hsh1)){
                        if(this.sockets.get(hsh1) && this.tickets.get(hsh1) && this.resolved.get(hsh1)){
                            //create ticket
                            this.tickets.get(hsh1)?.set(hsh0, {
                                request: newReq,
                                ticket: {
                                    txn: req.ticket.txn,
                                    recipient: req.ticket.recipient
                                }
                            })
                            rb.setRes({
                                status: ResponseCodes.ticket
                            }).setMessage({
                                text: "ticket created"
                            }).setType(QueryCodes.response).setReq(newReq)
                            return {
                                txn: hsh0,
                                recipient: hsh1
                            }
    
                        }else{
                            throw new DLInternalError("could not create ticket: ticket caches or socket entry not instantiated", "could not create ticket: ticket caches or socket entry not instantiated", InternalError.ticketCreation)
    
                        }
                    }else{
                        throw new DLInternalError("could not create ticket: ticket caches or socket entry do not exist", "could not create ticket: ticket caches or socket entry do not exist", InternalError.ticketCreation)
                    }*/
                }
                else {
                    throw new dlbuilder_1.DLInternalError("could not create ticket: request does not contain req object", "could not create ticket: request does not contain req object", dlbuilder_1.InternalError.ticketCreation);
                }
            }
            else {
                throw new dlbuilder_1.DLInternalError("could not create ticket: peer does not have a valid key", "could not create ticket: peer does not have a valid key", dlbuilder_1.InternalError.ticketCreation);
            }
        });
    }
    CreateTicket(peer, req, responseTicket, rb, cb) {
        let newReq = Object.assign({}, req);
        newReq.hops = 0;
        let tc = new queryobjects_1.Ticket(this, peer, responseTicket, newReq);
        rb.setRes({
            status: dlbuilder_1.ResponseCodes.ticket
        }).setMessage({
            text: "creating ticket"
        }).setType(dlbuilder_1.QueryCodes.response).setReq(req).setTicket(tc.Get());
        this._accessor._hasId(tc.TransformToKey()).then((v) => {
            if (v) {
                throw new dlbuilder_1.DLInternalError("could not create ticket: ticket already exists", "could not create ticket: ticket already exists", dlbuilder_1.InternalError.ticketCreation);
            }
            else {
                this._createTicket(req, tc, rb, peer).then((v) => {
                    if (cb) {
                        cb(v);
                    }
                }).catch((err) => {
                    if (err instanceof dlbuilder_1.DLInternalError) {
                        err.buildError(rb);
                        peer.Send(rb);
                    }
                });
            }
        });
        return tc;
    }
    /*async ResolveTicket(key: unknown){

    }*/
    RemoveTicket(key) {
    }
    ResolveTicket(tc, res, peer) {
        return __awaiter(this, void 0, void 0, function* () {
            if (tc.recipient && tc.txn) {
                this.Get([tc.txn]).then((v) => {
                    if (v.length > 0) {
                        //rb.DLNoSend("ticket resolved")
                        /*this._resolved.set(v[0].TransformToKey(), {ticket: v[0], response: message.res!})*/
                        v[0].Resolve(res, peer);
                    }
                });
                /*if(this.GetPeerCache().Has(message.ticket.recipient)){
                    if(this.GetPeerCache().Get([message.ticket.recipient])?.has(message.ticket.txn)) {
                        rb.DLNoSend("ticket resolved")
                        this.resolved.get(message.ticket.recipient)?.get(message.ticket.txn)?.push({
                            ...this.tickets.get(message.ticket.recipient!)!.get(message.ticket.txn)!,
                            response: message.res!
                        })
                        let newReq = {...this.tickets.get(message.ticket.recipient!)!.get(message.ticket.txn)!.request}
                        this.logger(`ticket resolve old hops ${newReq.hops}`)
                        newReq.hops -= 1
                        this.logger(`ticket resolve new hops ${newReq.hops}`)
                        rbb.from(message).setTicket(this.tickets.get(message.ticket.recipient!)!.get(message.ticket.txn)!.ticket).setReq(newReq).setType(QueryCodes.response)
                        this.filterSend(rbb, {
                            socket: message.ticket.recipient!,
                            reply: this.sockets.get(message.ticket.recipient)!
                        })
                        //this.filterSend(rb, context)
                        //prove malicous peer as opposed to proof of valid response
                        //add fields in protocol to provide fingerprint for network reporting purposes
    
                    }else{
                        throw new DLQueryBuilderError("txn does not exist for recipient", "txn does not exist for recipient", ErrorCodes.invalidResponse, context, message.ticket)
                    }
                }else{
                    throw new DLQueryBuilderError("invalid recipient", "invalid recipient", ErrorCodes.invalidResponse, context, message.ticket)
                }*/
            }
            else {
                /*throw new DLQueryBuilderError("no recipient provided", "no recipient provided", ErrorCodes.invalidResponse, context, message.ticket)*/
            }
        });
    }
    constructor(pc, logger, accessor) {
        super(logger, undefined, accessor);
        this._resolved = new Map();
        this._peerCache = pc;
    }
}
exports.ITicketCache = ITicketCache;
//export type HMTicketCache = Omit<ITicketCache<any>, keyof HMCache<Ticket>> & HMCache<Ticket>
