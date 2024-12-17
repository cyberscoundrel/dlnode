import EventEmitter from "events";
import { DLQueryBuilder, QueryCodes, DLQueryBuilderError, ErrorCodes, DLInternalError, InternalError, ResponseCodes } from "./dlbuilder";

import { HMCache } from "./hmcache";
import { DLNLogger, ILogger, ILogging } from "./logger";
import { DLQueryTicket, DLQuery, DLResponse, DLRequest } from "./zodschemas";
import { ICacheObject, IContent, IEndpoint, IPeer, PeerDirection, RawContent } from "./cacheobject";
import { HasherSHA256, IHasher, IHashing } from "./hasher";
import { IProtocol } from "./protocol";
import { Ticket } from "./queryobjects";
import { Props } from "./util";

export abstract class CacheAccessor<T extends ICacheObject> {
    async _getn(elms: Record<string, unknown>[]): Promise<T[]> {
        throw new Error("Method not implemented.");
    }
    async _getIds(elmIds: unknown[]): Promise<T[]> {
        throw new Error("Method not implemented.");
    }
    async _removeIds(elmIds: unknown[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async _removen(elms: Record<string, unknown>[]): Promise<void> {
        throw new Error("Method not implemented.");
    }
    //create payment broker and exchange field in response type
    //send wallet in request
    //send accepted agreement to server, server creates receipts/vouchers that get bulk processed by smart contracts on block chain
    async _add(key: unknown, elm: ICacheObject): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async _iterate(cb?: (t: T) => void): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async _has(obj: Record<string, unknown>): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    async _hasId(key: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
}
export class ICache<T extends ICacheObject, A extends CacheAccessor<T>> extends EventEmitter implements ILogging, IHashing {
    _logger: ILogger;
    _hasher: IHasher
    GetLogger(): ILogger {
        return this._logger
    }
    _accessor: A
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
    _preRefresh(): void{

    }
    _postRefresh(): void{

    }
    GetHashAlg(): IHasher {
        return this._hasher
    }



    async Get(keys: string[]): Promise<T[]> {
        return await this._accessor._getIds(keys)
    }
    async GetAll(): Promise<T[]> {
        let gatheredElms: T[] = []
        await this._accessor._iterate((v) => {
            gatheredElms.push(v)
        })
        return gatheredElms
    }
    async Find(keys: Record<string, unknown>[]): Promise<T[]> {
        return await this._accessor._getn(keys)
    }
    async RemoveIds(keys: string[]): Promise<void> {
        let removedElements = this._accessor._getIds(keys)
        this._accessor._removeIds(keys)
        this.emit('removal', removedElements)
        return
    }
    async RemoveN(keys: Record<string, unknown>[]): Promise<void>{
        let removedElements = this._accessor._getn(keys)
        this._accessor._removen(keys)
        this.emit('removal', removedElements)
        return
    }
    async Refresh(){
        this._preRefresh()
        await this._accessor._iterate()
        this.emit('refresh')
        this._postRefresh()
    }
    async Has(obj: Record<string, unknown>) {
        return await this._accessor._has(obj)
    }
    async HasId(key: string) {
        return await this._accessor._hasId(key)
    }
    protected constructor(logger: ILogger, hasher: IHasher = HasherSHA256.GetInstance(), accessor: A) {
        super()
        this._hasher = hasher
        this._logger = logger
        this._accessor = accessor
    }

}
export class IPeerCache<A extends CacheAccessor<IPeer<any>>> extends ICache<IPeer<any>, A>{
    _activeConnectionPool: Map<string, IPeer<IProtocol<any>>> = new Map()
    _ticketCache?: ITicketCache<any>
    _sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async _queryPeers(origin: IPeer<IProtocol<any>>, qb: DLQueryBuilder){
        (`querying peers for query ${JSON.stringify(qb.getReq(), null, 2)}`)
        //let data = undefined
        await this._sleep(1000)
        this.GetLogger().log(`querying peers for socket ${origin.TransformToKey()}/${origin._fields.host}:`)
        this.GetLogger().log(`original query req ${JSON.stringify(qb.getReq(), null, 2)}`)
        //let qb = new DLQueryBuilder()
        
        let newReq = ({...qb.getReq()!})
        newReq.hops += 1

        qb.setReq(newReq)
        //let generated = qb.generate()
        this._activeConnectionPool.forEach((v, k) => {
            if(v._fields.active && v._fields.direction == PeerDirection.bidirectional){
                v.Send(qb)
            }
        })
    }
    async QueryPeers(origin: IPeer<IProtocol<any>>, qb: DLQueryBuilder){
        this.GetLogger().log(`querying peers for query ${JSON.stringify(qb.getReq(), null, 2)}`)
        this._queryPeers(origin, qb)
        //queries only active peers
        
    }
    Connect(arg: IPeer<any>){
        this._accessor._add(arg.TransformToKey(), arg)
        this._activeConnectionPool.set(arg.TransformToKey(), arg)
        arg.Init()
        //_add()
        //this logic only directly manages the active connection pool
        //connection logic
    }
    Disconnect(peers: Record<string, unknown>){
        //_removeIds()
        //this logic only directly manages the active connection pool
        //disconnection logic
    }
    Pair(ticketCache: ITicketCache<any>){
        this._ticketCache = ticketCache
        ticketCache.SetPeerCache(this)
    }
    _getTicketCache(): ITicketCache<any> {
        return this._ticketCache!
    }
    constructor(logger: ILogger, accessor: A) {
        super(logger, undefined, accessor)
        this.addListener('disconnect', () => {

        })
    }
}
/*export type HMPeerCache = Omit<IPeerCache, keyof HMCache<IPeer<IProtocol<any>>>> & HMCache<IPeer<IProtocol<any>>>*/

export class IContentCache<A extends CacheAccessor<IContent>> extends ICache<IContent, A> {
    
    IndexContent(args: IContent){
        this._accessor._add(args.TransformToKey(), args)
    }
    DeIndexContent(arg: unknown[]){

    }
    AddRawContent(cont: string): IContent{
        let c = new RawContent(this, 'raw', cont)
        this.IndexContent(c)
        return c
    }
    constructor(logger: ILogger, accessor: A) {
        super(logger, undefined, accessor)
    }
}
/*export type _HMContentCache = Omit<IContentCache, keyof HMCache<IContent>> & HMCache<IContent>
export class HMContentCache extends _HMContentCache {
    
}*/


export class IEndpointCache<A extends CacheAccessor<IEndpoint>> extends ICache<IEndpoint, A> {
    IndexEndpoint(args: Partial<Props<IEndpoint>>){

    }
    DeIndexEndpoint(arg: unknown){

    }
    constructor(logger: ILogger, accessor: A) {
        super(logger, undefined, accessor)
    }
}
//export type HMEndpointCache = Omit<IEndpointCache, keyof HMCache<IEndpoint>> & HMCache<IEndpoint>
export class ITicketCache<A extends CacheAccessor<Ticket>> extends ICache<Ticket, A> {
    _peerCache: IPeerCache<any>
    //_response: Map<string, DLResponse[]> = new Map()
    SetPeerCache(pc: IPeerCache<any>){
        this._peerCache = pc
    }
    GetPeerCache(): IPeerCache<any> {
        return this._peerCache
    }
    async _createTicket(req: DLRequest, tc: Ticket, rb: DLQueryBuilder, peer: IPeer<any>): Promise<Ticket> {
        //console.log(`ticket creation for ${JSON.stringify(req)}`)
        let rbbb = new DLQueryBuilder()
        rbbb.from(rb._generateNoValidate())
        this._logger.log(`ticket creation for ${JSON.stringify(req, null, 2)}`)
        
        if(peer.TransformToKey()){
            //let hsh1 = peer.TransformToKey()
            if(req){
                //let hsh0 = this.GetHashAlg().Hash(newReq)
                    this._accessor._add(tc.TransformToKey(), tc)
                    rbbb.setRes({
                        status: ResponseCodes.ticket
                    }).setMessage({
                        text: "ticket created"
                    }).setType(QueryCodes.response).setReq(req)
                    peer.Send(rbbb)
                    return tc
                
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
            }else{
                throw new DLInternalError("could not create ticket: request does not contain req object", "could not create ticket: request does not contain req object", InternalError.ticketCreation)
            }
        }else{
            throw new DLInternalError("could not create ticket: peer does not have a valid key", "could not create ticket: peer does not have a valid key", InternalError.ticketCreation)
        }
            

    




    }
    CreateTicket(peer: IPeer<IProtocol<any>>, req: DLRequest, responseTicket: DLQueryTicket, rb: DLQueryBuilder, cb?: (tkt: Ticket) => void): Ticket{
        let newReq = { ...req}
        newReq.hops = 0
        this._logger.log(`creating ticket for ${JSON.stringify({req: newReq, peerHost: peer.GetHost() }, null, 2)}`)
        let tc = new Ticket(this, peer, responseTicket, newReq)
        rb.setRes({
            status: ResponseCodes.ticket
        }).setMessage({
            text: "creating ticket"
        }).setType(QueryCodes.response).setReq(req).setTicket(tc.Get())
        
        this._accessor._getIds([tc.TransformToKey()]).then((v) => {
            if(v.length > 0){
                this._logger.log(`could not create ticket: ticket already exists`)
                this._logger.log(`existing ticket: ${JSON.stringify({
                    ticket: v[0].GetTicket(),
                    request: v[0].GetRequest(),
                    rhash: this.GetHashAlg().Hash(v[0].GetRequest()),
                    host: v[0]._peer.GetHost()
                }, null, 2)}`)
                
                throw new DLInternalError("could not create ticket: ticket already exists", "could not create ticket: ticket already exists", InternalError.ticketCreation)
            }
            else{
                
                this._createTicket(req, tc, rb, peer).then((val) => {
                    if(cb){
                        cb(val)
                    }
                }).catch((err) => {  
                    if(err instanceof DLInternalError) {
                        err.buildError(rb)
                        peer.Send(rb)
                    }
                })
            }
        }).catch((err) => {
            this._logger.log(`could not create ticket: ${err}`)
            if(err instanceof DLInternalError) {
                err.buildError(rb)
                peer.Send(rb)
            }
        })

        return tc



    }
    /*async ResolveTicket(key: unknown){

    }*/
    
    private RemoveTicket(key: Ticket){

    }
    async ResolveTicket(tc: DLQueryTicket, res: DLResponse, peer: IPeer<IProtocol<any>>) {
        if(tc.recipient && tc.txn){ 
            this.Get([tc.txn]).then((v) => {
                if(v.length > 0){
                    //rb.DLNoSend("ticket resolved")
                    /*this._resolved.set(v[0].TransformToKey(), {ticket: v[0], response: message.res!})*/
                    v[0].Resolve(res!, peer)

                    
                }
            })
            
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
            
        }else{
            /*throw new DLQueryBuilderError("no recipient provided", "no recipient provided", ErrorCodes.invalidResponse, context, message.ticket)*/
        }
        

    }
    constructor(pc: IPeerCache<any>, logger: ILogger, accessor: A) {
        super(logger, undefined, accessor)
        this._peerCache = pc
    }
    _resolved: Map<string, {ticket: Ticket, response: DLResponse}> = new Map()
}
//export type HMTicketCache = Omit<ITicketCache<any>, keyof HMCache<Ticket>> & HMCache<Ticket>