"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const cacheobject_1 = require("./cacheobject");
const dlbuilder_1 = require("./dlbuilder");
const hasher_1 = require("./hasher");
/*export class ResponseO{
    _status: ResponseCodes
    _content: any
    GetStatus(){
        return this._status
    }
    SetStatus(status: ResponseCodes){
        this._status = status
    }

    constructor(status: ResponseCodes, content: any){
        this._status = status
        this._content = content
    }
    ToJson(){
        return {
            status: this._status,
            content: this._content
        }
    }
    ToObject(): DLResponse {
        return this.ToJson() as DLResponse
    }
}
export class RequestO{
    _contentHash: {
        hash: string
    }
    _hops: number
    constructor(contentHash: string, hops: number){
        this._contentHash = {
            hash: contentHash
        }
        this._hops = hops
    }
    ToJson(){
        return {
            contentHash: this._contentHash,
            hops: this._hops
        }
    }
    ToObject(): DLRequest {
        return this.ToJson() as DLRequest
    }
}*/
class Ticket extends cacheobject_1.ICacheObject {
    TransformToKey() {
        return this._cache.GetHashAlg().Hash(this._peer.TransformToKey() + this._cache.GetHashAlg().Hash(this._fields._request));
        //return this._peer.TransformToKey()
    }
    /*TransformToIndex(): string {
        return this._peer.TransformToKey()
        //return this._ticket.txn!
    }*/
    constructor(cache, peer, tc = {}, r = {}) {
        super();
        //indexed by response
        this._responses = new Map();
        //this._fields._ticket = tc
        this._peer = peer;
        //this._request = r
        this._cache = cache;
        this._fields = {
            _ticket: tc,
            _request: r,
            _peerId: peer.TransformToKey()
        };
    }
    Get() {
        return this._fields._ticket;
    }
    GetTicket() {
        return {
            txn: this.TransformToKey(),
            recipient: this._fields._peerId
        };
    }
    GetRequest() {
        return this._fields._request;
    }
    GetResponses() {
        return Array.from(this._responses.values()).flat();
    }
    Resolve(response, sender) {
        let rb = new dlbuilder_1.DLQueryBuilder();
        let rbb = new dlbuilder_1.DLQueryBuilder();
        if (!this._responses.has(hasher_1.HasherSHA256.GetInstance().Hash(response))) {
            this._responses.set(hasher_1.HasherSHA256.GetInstance().Hash(response), [response]);
            //qb
            rbb.from({
                type: dlbuilder_1.QueryCodes.response,
                req: this.GetRequest(),
                res: response,
                ticket: this.Get(),
                message: {}
            });
            this._peer.Send(rbb);
            //_peer.send
        }
        rb.DLNoSend("ticket resolved");
        sender.Send(rb);
    }
}
exports.Ticket = Ticket;
