import express, { Express, Request, Response } from "express";
import axios from 'axios'
import path from 'path'
import crypto from 'crypto'
import portfinder from 'portfinder'
import expressWs from 'express-ws';
import WebSocket, { WebSocketServer } from 'ws';
import {z, ZodError} from 'zod'
import type { DLQuery, DLRequest, DLResponse, DLQueryTicket, DLMessage } from "./zodschemas";
import { DLQueryZ, DLRequestZ, DLResponseZ, DLMessageZ } from "./zodschemas";
import {DLQueryBuilder, DLInternalError, DLNodeErrorBase, DLQueryBuilderError, QueryCodes, ResponseCodes, ErrorCodes, DLQueryContext, InternalError} from './dlbuilder'
import * as stream from 'stream'
import { stdout } from "process";

type DLNodeTicket = {
    request: DLRequest,
    ticket: DLQueryTicket
}
type DLNodeTicketResponse = DLNodeTicket & {
    response: DLResponse,
    timestamp?: Date
}
type AnyFn = (...args: unknown[]) => unknown
export type ClassProperties<C> = {
    [K in keyof C as C[K] extends AnyFn | ((m: any) => void)[] ? never : K]: C[K]
}


export class DLayerNode {
    secret: string
    isDeployed: Boolean = false
    functionMap: Map<string, () => {}> = new Map()
    contentMap: Map<string, any> = new Map()
    endpointMap: Map<string, string> = new Map()
    maps = [this.contentMap, this.functionMap, this.endpointMap]
    appInst: expressWs.Instance
    app: expressWs.Application
    port: number
    bootstraps: string[]
    peers: string[] = []
    eat: boolean = false
    logHooks: ((m: any) => void)[] = []
    contentHooks: ((m: any) => void)[] = []
    //key: hash of peer
    sockets: Map<string, (m: any) => void>
    //key: hash of recipient
    tickets: Map<string, Map<string, DLNodeTicket>>
    resolved: Map<string, Map<string, DLNodeTicketResponse[]>>
    //sha: crypto.Hash = crypto.createHash('sha256')
    log: string = ""
    //logReadable: stream.Readable = new stream.Readable()
    content: string = ""
    //contentReadable: stream.Readable = new stream.Readable()
    debug: string = ""
    outputDebug: boolean = true
    contentHit(hash: string) {
        return this.contentMap.has(hash)
    }
    hash(cont: any){
        let sha = crypto.createHash('sha256')
        sha.update('' + cont)
        return sha.digest('hex')
    }
    filterSend(rb: DLQueryBuilder, context: DLQueryContext, rules?: {}){
        if(true){
            let pre = rb._generateNoValidate()
            let outbound = rb.generate()
            this.logger(`sending message back to ${context.socketID}/${context.socket}: ${JSON.stringify(outbound, null, 2)}`)
            this.logger(`from ${JSON.stringify(pre)}`)
            if(!(outbound.type === QueryCodes.nosend || (outbound.res && (outbound.res.status == ResponseCodes.nosend || outbound.res.status == ResponseCodes.error)))) {
                this.logger(`message sent`)
                //generate before conditional
                context.reply(JSON.stringify(outbound))
            }else{
                this.logger(`message caught`)
            }
        }
    }
    handleDLNodeError(err: DLNodeErrorBase, rb: DLQueryBuilder){
        //log or pass build or decide what errors to nosend
        err.buildError(rb)
    }
    async resolveTicket(message: DLQuery, context: DLQueryContext) {
        let rb: DLQueryBuilder = new DLQueryBuilder()
        let rbb: DLQueryBuilder = new DLQueryBuilder()
        if(message.ticket.recipient) {
            if(this.tickets.has(message.ticket.recipient)){ 
                if(this.tickets.get(message.ticket.recipient)?.has(message.ticket.txn)) {
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
                    this.filterSend(rb, context)
                    //prove malicous peer as opposed to proof of valid response
                    //add fields in protocol to provide fingerprint for network reporting purposes

                }else{
                    throw new DLQueryBuilderError("txn does not exist for recipient", "txn does not exist for recipient", ErrorCodes.invalidResponse, context, message.ticket)
                }
            }else{
                throw new DLQueryBuilderError("invalid recipient", "invalid recipient", ErrorCodes.invalidResponse, context, message.ticket)
            }
            
        }else{
            throw new DLQueryBuilderError("no recipient provided", "no recipient provided", ErrorCodes.invalidResponse, context, message.ticket)
        }
        

    }
    resolveResponse(message: DLQuery, rb: DLQueryBuilder, context: DLQueryContext) {
        let ticket = message.ticket
        this.logger(`resolve response`)
        switch(message.res!.status){
            case ResponseCodes.hit:
                this.resolveTicket(message, context).catch((err) => {
                    if(err instanceof DLNodeErrorBase) {
                        let rbb = new DLQueryBuilder()
                        this.handleDLNodeError(err, rbb)
                        this.filterSend(rbb, context)
                    }
                })
                rb.DLNoSend(`received hit from peer`)
                break
            default: 
                this.logger(`received response from ${context.socketID}: ${JSON.stringify(message, null, 2)}`)
        }
    }
    resolveError(message: DLQuery, rb: DLQueryBuilder, context: DLQueryContext) {

    }
    resolveDisconnect(id: string){

    }
    resolveRequest(message: DLQuery, rb: DLQueryBuilder, context: DLQueryContext) {
        //console.log(`received request ${JSON.stringify(message)}`)
        this.logger(`received request ${JSON.stringify(message)}`)
        rb.setType(QueryCodes.response)
        if(this.contentHit(message.req!.contentHash.hash)) {
            this.logger(`content hit: ${this.contentMap.get(message.req!.contentHash.hash)}`)
            rb.setRes({
                status: ResponseCodes.hit,
                content: [{
                    content: this.maps[message.type].get((message.req!.contentHash!.hash))
                }]
            }).setMessage({}).setReq(message.req!)
            this.logger(`rb ${JSON.stringify(rb._generateNoValidate(), null, 3)}`)

        }else{
            this.logger(`no hit, peer query`)
            
            this.queryPeers(message, this.createTicket(message, rb, context), context).catch((err) => {
                if(err instanceof DLNodeErrorBase) {
                    let rbb = new DLQueryBuilder()
                    this.handleDLNodeError(err, rbb)
                    this.filterSend(rbb, context)
                }
            })
            
        }
        

    }
    dlayer(req: DLQuery, rb: DLQueryBuilder, context: DLQueryContext){
        //console.log(`dlayer ${req}`)
        this.logger(`dlayer ${JSON.stringify(req, null, 2)}`)
        DLQueryBuilder.validate(req)
        //console.log(`validated request`)
        this.logger(`validated request`)
        rb.setTicket(req.ticket)
        switch (req.type){
            case QueryCodes.request : 
                if(req.req?.hops && req.req.hops < 3){
                    this.resolveRequest(req, rb, context)
                }else{
                    this.logger(`overhopped ${req.req?.hops != undefined ? 'true' : 'false'} && ${req.req!.hops! < 3 ? 'true' : 'false'}`)
                    rb.DLNoSend()
                }
                break
            case QueryCodes.response : 
                if(req.req?.hops != undefined && req.req.hops > -1){
                    this.logger(`pls resolve response`)
                    this.resolveResponse(req, rb, context)
                }else{
                    this.logger(`overhopped ${req.req?.hops != undefined ? 'true' : 'false'} && ${req.req!.hops! > -1 ? 'true' : 'false'}`)
                    rb.DLNoSend()
                }
                break
        }
        //return rb.generate()
            //hash of enpoint code on blockchain
    }
    sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async queryPeers(req: DLQuery, newTicket: DLQueryTicket, context: DLQueryContext) {
        this.logger(`querying peers for query ${JSON.stringify(req, null, 2)}`)
        //let data = undefined
        await this.sleep(1000)
        this.logger(`querying peers for socket ${context.socketID}:`)
        this.logger(`original query req ${JSON.stringify(req.req, null, 2)}`)
        let qb = new DLQueryBuilder()
        
        let newReq = {
            contentHash: req.req?.contentHash!,
            hops: req.req?.hops! + 1
        }

        qb.from(req).setTicket(newTicket).setReq(newReq)
        let generated = qb.generate()
        this.sockets.forEach((v, k) => {
            if(k !== context.socketID){
                v(JSON.stringify(generated))
            }
        })
    }
    createTicket(req: DLQuery, rb: DLQueryBuilder, context: DLQueryContext): DLQueryTicket {
        //console.log(`ticket creation for ${JSON.stringify(req)}`)
        this.logger(`ticket creation for ${JSON.stringify(req, null, 2)}`)
        
        if(context.socketID){
            let hsh1 = context.socketID
            if(req.req){
                let newReq = { ...req.req}
                newReq.hops = 0
                let hsh0 = this.hash(newReq)
                newReq.hops = req.req.hops
                if(this.sockets.has(hsh1) && this.tickets.has(hsh1) && this.resolved.has(hsh1)){
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
                }
            }else{
                throw new DLInternalError("could not create ticket: request does not contain req object", "could not create ticket: request does not contain req object", InternalError.ticketCreation)
            }
            

        }else{
            throw new DLInternalError("could not create ticket: context socket not provided", "could not create ticket: context socket not provided", InternalError.ticketCreation)
        }
        




    }
    getStat() {
        const data: ClassProperties<DLayerNode> = { ...this }
        return data
        
        /*return {
            peers: this.peers,
        }*/
    }
    initWS(ws: WebSocket, remoteAddress: string){
        //console.log(`initializing socket with url ${remoteAddress}`)
        this.logger(`initializing socket with url ${remoteAddress}`)
        ws.on('message',(msg) => {
            let qb: DLQueryBuilder = new DLQueryBuilder()
            let context = {
                reply:(m: any) => ws.send(m),
                socketID: this.hash(remoteAddress),
                socket: remoteAddress
            }
            try{
                //console.log(`received message ${msg}`)
                this.logger(`received message from ${remoteAddress}: ${msg.toString()}`)
                let prsed = JSON.parse(msg.toString())
                let dmsg = DLQueryZ.parse(JSON.parse(msg.toString()))
                this.logger(`psd content ${JSON.stringify(prsed, null, 2)}`)
                //console.log(dmsg)
                //this.logger(dmsg)
                this.dlayer(dmsg, qb, context)
            }catch(err){
                //console.log(`error in dlayer ${err}`)
                this.logger(`error in dlayer ${err}`)
                if(err instanceof DLQueryBuilderError){
                    //console.log(`querybuilder error`)
                    this.logger(`querybuilder error`)
                    this.handleDLNodeError(err, qb)
                }else if(err instanceof ZodError){
                    //console.log(`zod error`)
                    this.logger(`zod error`)
                    qb.DLError(ErrorCodes.internalError, "zod validation error: message does not meet schema requirements", DLQueryBuilder.NoTicket)
                }
            }
            this.logger(`end of dlayer`)
            this.filterSend(qb, context)
        })
        ws.on('close',() => {
            //console.log(`${ws.url} disconnected`)
            this.logger(`${ws.url} disconnected`)
            this.socketTearDown(ws.url)
        })
        return ws
        
    }
    socketSetUp(url: string, ws: WebSocket){
        let hsh = this.hash(url)
        this.sockets.set(hsh, (m: any) => {
            ws.send(m)
        })
        this.tickets.set(hsh, new Map())
        this.resolved.set(hsh, new Map())
    }
    socketTearDown(url: string){
        let hsh = this.hash(url)
        this.sockets.delete(hsh)
        this.tickets.delete(hsh)
        this.resolved.delete(hsh)
    }
    updateSessions() {
        this.peers.forEach((e, i) => {
            let hsh = this.hash(e)
            if(!this.sockets.has(hsh)){
                let ws = this.initWS(new WebSocket(e), e)
                this.socketSetUp(e, ws)/*giving advice is so easy and vicariously satisfies the desire to resolve your own failings*/
                
            }
        })
        this.appInst.getWss().clients.forEach((client) => {
            this.socketSetUp(client.url, client)
        })
        
    }
    listen(start: number) {
        portfinder.setBasePort(start)
        return portfinder.getPortPromise().then((p) => {
            this.port = p
            console.log(`start port ${start} claim port ${p}`)
            this.app.listen(p, () => {
                //console.log(`DLayer listening on port ${this.port}`)
                this.logger(`DLayer listening on port ${this.port}`)
            })
            return p
        })
        
        //if port is used, use next and return port

    }
    deploy() {
        //this.peers

        return this.listen(this.port).then((e) => {
            console.log(`port after listen ${e}`)
            let shsh = this.hash(this.secret)
            this.sockets.set(shsh, (m: any) => {
                this.onContent(m)
                //this.content += m
            })
            this.tickets.set(shsh, new Map())
            this.resolved.set(shsh, new Map())
            return e
        })
    }
    requestContent(contentHash: string) {
        this.logger(`request for content hash ${contentHash}`)
        let rb = new DLQueryBuilder()
        let newRequest: DLRequest = {
            contentHash: {
                hash: contentHash
            },
            hops: 0
        }
        let newTicket: DLQueryTicket = {
            recipient: this.hash(this.secret),
            txn: this.hash(newRequest)
        }
        rb.setType(QueryCodes.request).setReq(newRequest).setMessage({}).setTicket(newTicket)
        this.tickets.get(this.hash(this.secret))?.set(this.hash(newRequest), {
            request: newRequest,
            ticket: newTicket
        })
        this.queryPeers(rb.generate(), newTicket, {
            reply: this.sockets.get(this.hash(this.secret))!,
            socketID: this.hash(this.secret),
            socket: this.secret
        })
    }
    addPeer(peer: string){
        this.peers.push(peer)
        this.updateSessions()
    }
    addPeers(peers: string[]){
        peers.forEach((e, i) => {
            this.peers.push(e)
        })
        this.updateSessions()
    }
    addRawContent(content: any){
        this.contentMap.set(this.hash(content), content)
    }
    bootstrapPeers() {
        this.bootstraps.forEach((e, i) => {
            let ax = axios.create({
                baseURL: `https://${e}`,
                timeout: 1000
            })
            ax.get('/bootstrap').then((res) => {
                res.data.peers.forEach((e: any, i: any) => {
                    //this.peers.push(e)
                })
            })
            this.peers.push(e)
        })
        //this.updateSessions()

    }
    logger(m: any, level: number = 0) {
        if(this.outputDebug || level == 0) {
            this.logHooks.forEach((e, i) => {
                //console.log(`calling log hook ${i}`)
                e(`[localhost:${this.port}]  ` + m)
            })
        }
        if(level == 1){
            this.debug = `[localhost:${this.port}]  ` + m
        }
    }
    logHook(hook: (m: any) => void){
        this.logHooks.push(hook)
    }
    onContent(m: any){
        this.contentHooks.forEach((e, i) => {
            e(`[localhost:${this.port}]  ` + m)
        })
    }
    contentHook(hook: (m: any) => void){
        this.contentHooks.push(hook)
    }
    constructor(port: number, secret: string = "secret", peers: string[] = [], bootstraps: string[] = []) {
        this.tickets = new Map()
        this.resolved = new Map()
        this.secret = secret
        this.port = port
        this.appInst = expressWs(express())
        this.app = this.appInst.app
        this.peers = peers
        this.sockets = new Map()
        this.bootstraps = bootstraps
        this.bootstrapPeers()
        this.logHook((m: any) => {
            this.log += m
            console.log(m)
        })
        this.contentHook((m: any) => {
            this.content += m
        })
        this.app.ws('/', (ws, req) => {
            if(req.socket.remoteAddress){
                this.peers.push(`ws://${req.socket.remoteAddress}:${req.socket.remotePort}`)
            }
            this.logger(`connection from ${req.socket.remoteAddress}:${req.socket.remotePort}`)
            //console.log(`connection from ${req.socket.remoteAddress}:${req.socket.remotePort}`)
            this.socketSetUp(`ws://${req.socket.remoteAddress}:${req.socket.remotePort}`, this.initWS(ws, `ws://${req.socket.remoteAddress}:${req.socket.remotePort}`))
        })
        this.app.get('/bootstrap', (req, res) => {
            res.send(this.peers)
        })
    }
}