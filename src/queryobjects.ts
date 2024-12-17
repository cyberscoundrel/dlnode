import { ICache, ITicketCache } from "./cache"
import { ICacheObject, IPeer } from "./cacheobject"
import { DLQueryBuilder, QueryCodes, ResponseCodes } from "./dlbuilder"
import { HasherSHA256 } from "./hasher"

import { IProtocol } from "./protocol"


import { DLResponse, DLRequest, DLQueryTicket } from "./zodschemas"

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
export class Ticket extends ICacheObject{
    /*_ticket: Partial<DLQueryTicket>
    _request: Partial<DLRequest>*/
    _cache: ITicketCache<any>
    _peer: IPeer<IProtocol<any>>
    //indexed by response
    _responses: Map<string, DLResponse[]> = new Map()
    _fields: {
        _ticket: Partial<DLQueryTicket>
        _request: Partial<DLRequest>
        _peerId: string
        
    }
    TransformToKey(): string {
        return this._cache.GetHashAlg().Hash(this._peer.TransformToKey() + this._cache.GetHashAlg().Hash(JSON.stringify(this._fields._request)))
        //return this._peer.TransformToKey()
    }
    /*TransformToIndex(): string {
        return this._peer.TransformToKey()
        //return this._ticket.txn!
    }*/
    constructor(cache: ITicketCache<any>, peer: IPeer<any>, tc: Partial<DLQueryTicket> = {}, r: Partial<DLRequest> = {}){
        super()
        //this._fields._ticket = tc
        this._peer = peer
        //this._request = r
        this._cache = cache
        this._fields = {
            _ticket: tc,
            _request: r,
            _peerId: peer.TransformToKey()
        }
        this._fields._ticket = tc.txn! != '000' ? tc :
        {
            txn: this.TransformToKey(),
            recipient: this._fields._peerId
        } 
    }
    Get(): DLQueryTicket {
        return this._fields._ticket as DLQueryTicket
    }
    GetTicket(): DLQueryTicket {
        return {
            txn: this.TransformToKey(),
            recipient: this._fields._peerId
        } as DLQueryTicket
    }
    GetRequest(): DLRequest {
        return this._fields._request as DLRequest
    }
    GetResponses(): DLResponse[] {
        return Array.from(this._responses.values()).flat()
    }
    Resolve(response: DLResponse, sender: IPeer<any>){
        let rb: DLQueryBuilder = new DLQueryBuilder()
        let rbb: DLQueryBuilder = new DLQueryBuilder()
        if(!this._responses.has(HasherSHA256.GetInstance().Hash(response))){
            this._responses.set(HasherSHA256.GetInstance().Hash(response), [response])
            
            //qb
            rbb.from({
                type: QueryCodes.response,
                req: this.GetRequest(),
                res: response,
                ticket: this.Get(),
                message: {}
            })
            this._peer.Send(rbb)
            //_peer.send

        }
        rb.DLNoSend("ticket resolved")
        sender.Send(rb)
    }
}