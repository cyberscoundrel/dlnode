import WebSocket, { WebSocketServer } from 'ws';
import { IProtocol, LocalProtocol, WSProtocol } from './protocol';
import { Props } from './util';
import { ICache, IContentCache, IPeerCache } from './cache';
import { DLQueryBuilder, QueryCodes, ResponseCodes } from './dlbuilder';
import { DLResponse } from './zodschemas';
import { ILogger, ILogging, PeerLogger } from './logger';
import { DLayerNode } from './node';
import { Ticket } from './queryobjects';

export enum PeerDirection {
    bidirectional = 0,
    reciever = 1
}
export abstract class ICacheObject{
    abstract _cache: ICache<any, any>
    abstract _fields: Record<string, unknown>
    GetKeyFields(): Record<string, unknown> {
        return {...this._fields as Record<string, unknown>}
    }
    GetFields(): typeof this._fields {
        return this._fields
    }
    //must be unique
    /*_assertIsType(obj: unknown): asserts obj is Partial<this> {
        if(obj instanceof Object) {
            Object.keys(obj).forEach((v, i) => {
                if((this.GetKeyFields() as Record<string, unknown>)[v] == undefined){
                    throw new Error("not a valid type")
                }
            })
            return
        }
        throw new Error("not a valid type")
    }*/
    TransformToKey(): string {
        return this._cache.GetHashAlg().Hash(JSON.stringify(this.GetKeyFields()))
    }
    MatchKeyFields(object: Record<string, unknown>, overlap: boolean): boolean {
        //this._assertIsType(object)
        /*let overlapCount = 0
        let keyFields = this.GetKeyFields()*/
        const objectKeys = Object.keys(object);
        const fieldKeys = Object.keys(this._fields);

        if (overlap) {
            return fieldKeys.some((key) => objectKeys.includes(key));
        } else {
            return fieldKeys.every((key) => objectKeys.includes(key));
        }
        /*Object.keys(object as object).forEach((v, i) => {
            if(object[v] == (keyFields as Record<string, unknown>)[v]){
                overlapCount++
            }
        })
        if(overlap){
            return overlapCount > 0
        }else{
            return overlapCount == Object.keys(object as object).length
        }*/
        
    }
    protected constructor(){
        //this._cache = cache
    }
}



export class IPeer<P extends IProtocol<any>> extends ICacheObject implements ILogging{
    _peerLogger: PeerLogger
    _cache: IPeerCache<any>
    _protocol: IProtocol<this>
    _fields: {
        host: string
        active: boolean
        direction: PeerDirection
        
    }
    send?: (m: any) => void
    TransformToKey(): string {
        return this._cache.GetHashAlg().Hash(this._fields.host)
    }
    GetProtocol(): IProtocol<this> {
        return this._protocol
    }
    GetLogger(): ILogger {
        return this._peerLogger
    }
    TransformToIndex(): string {
        return this.TransformToKey()
    }
    Init(): void {
        this._protocol.InitPeer(this)
        
    }
    SetSend(send: (m: any) => void){
        this.send = send
    }
    SetDirection(dir: PeerDirection){
        this._fields.direction = dir
    }
    SetActive(active: boolean){
        this._fields.active = active
    }
    Deactivate(){
        this.SetActive(false)
    }
    GetHost(): string {
        return this._fields.host!
    }
    _filterSend(rb: DLQueryBuilder, rules?: {}){
        if(true){
            let pre = rb._generateNoValidate()
            let outbound = rb.generate()
            this._cache.GetLogger().log(`sending message back to ${this.TransformToKey()}/${this._fields.host}: ${JSON.stringify(outbound, null, 2)}`)
            this._cache.GetLogger().log(`from ${JSON.stringify(pre)}`)
            if(!(
                outbound.type === QueryCodes.nosend || 
                (outbound.res && 
                    (outbound.res.status == 
                        ResponseCodes.nosend || 
                        outbound.res.status == ResponseCodes.error)
                    )
                )
            ) {
                this._cache.GetLogger().log(`message sent`)
                //generate before conditional
                if(this.send){
                    this.GetLogger().log(`outbound message`)
                    this.send(outbound)
                }
                //this.Send(JSON.stringify(outbound))
            }else{
                this._cache.GetLogger().log(`message caught`)
            }
        }
    }
    Send(m: DLQueryBuilder){
        this._filterSend(m)
    }
    constructor(cache: IPeerCache<any>, protocol: P, host: string, dir = PeerDirection.bidirectional, active = true){
        super()
        this._cache = cache
        this._protocol = protocol
        this._fields = {
            host: host,
            active: active,
            direction: dir
        }
        this._peerLogger = new PeerLogger(this, this._cache.GetLogger())
    }
}

export class WSPeer extends IPeer<WSProtocol> {
    _ws: WebSocket
    _dln: DLayerNode
    constructor(dln: DLayerNode, cache: IPeerCache<any>, ws: WebSocket, remote: string = ws.url){
        super(cache, new WSProtocol(dln.logger), remote)
        this._ws = ws
        this._dln = dln
    }
}
export class LocalPeer extends IPeer<LocalProtocol> {
    _localPeerHooks: ((m: any) => void)[]
    _content: string = ""
    _dln: DLayerNode
    constructor(dln: DLayerNode, cache: IPeerCache<any>, name: string, hooks: ((m: any) => void)[] = 
        [
            (m: any) => {
                this._content += m
            },
            (m: any) => {
                console.log(m)
            }
        ]
    ){
        super(cache, new LocalProtocol(dln.logger), name, PeerDirection.reciever)
        this._localPeerHooks = hooks
        this._dln = dln
    }
    async CreateRequest(cHash: string, hops: number): Promise<DLQueryBuilder>{
        let qb: DLQueryBuilder = new DLQueryBuilder()
        let newTicket = this._dln.ticketCache.CreateTicket(this, {
            contentHash: {
                hash: cHash
            },
            hops: hops
        }, DLQueryBuilder.NoTicket, qb)
        this.GetLogger().log(`creating ticket ${JSON.stringify({
            ticket: newTicket.GetTicket(),
            request: newTicket.GetRequest(),
            rhash: this._cache.GetHashAlg().Hash(newTicket.GetRequest()),
            peer: this.GetHost()
         }, null, 2)}`)
        return qb.setReq({
            contentHash: {
                hash: cHash
            },
            hops: hops
        }).setMessage({}).setTicket(newTicket.GetTicket()).setType(QueryCodes.request)
    }
    RequestContent(cHash: string, hops: number){
        this.CreateRequest(cHash, hops).then((qb) => {
            this._cache.QueryPeers(this, qb)
        })
    }
    //hook for received messages
    //hook for delivered messages
    AddHook(hook: (m: any) => void) {
        this._localPeerHooks.push(hook)
    }
    RunHooks(m: any){
        this._localPeerHooks.forEach((e, i) => {
            e(m)
        })
    }
}

export abstract class IContent extends ICacheObject{
    _fields: {
        type: string
        raw: string
    }
    _cache: IContentCache<any>
    TransformToKey(): string {
        return this._cache.GetHashAlg().Hash(this._fields.raw)
    }
    constructor(cache: IContentCache<any>, type: string, raw: string){
        super()
        this._cache = cache
        this._fields = {
            type: type,
            raw: raw
        }
    }   
    abstract GenerateResponse(): DLResponse
    abstract FromResponse(response: DLResponse): unknown

}

export class RawContent extends IContent {
    GenerateResponse(): DLResponse {
        return {
            status: ResponseCodes.hit,
            content: [{
                content: this._fields.raw
            }]
        }
    }
    FromResponse(response: DLResponse): RawContent {
        return new RawContent(this._cache, 'raw', response.content![0].content)
        
    }
}

export abstract class IEndpoint extends ICacheObject{
    _fields: {
        host: string
        endpoint: string
        publicKey: string
        privateKey?: string
    }
    TransformToKey(): string {
        return this._fields.publicKey
    }
    constructor(cache: IContentCache<any>, host: string, endpoint: string, pk: string){
        super()
        this._fields = {

            host: host,
            endpoint: endpoint,
            publicKey: pk,

        }
    }  
}
/*
export abstract class IBinnedCacheObject extends ICacheObject{
    //may or may not be unique
    abstract TransformToIndex(): string
    constructor(cache: ICache<any>){
        super(cache)
    }
}*/