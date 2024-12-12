import express from "express";
import axios from 'axios'

import portfinder from 'portfinder'
import expressWs from 'express-ws';
import WebSocket from 'ws';

import type { DLQuery } from "./zodschemas";

import {DLQueryBuilder, DLInternalError, DLNodeErrorBase, DLQueryBuilderError, QueryCodes, ResponseCodes, ErrorCodes, DLQueryContext, InternalError} from './dlbuilder'

import { EventEmitter } from "stream";
import { IContentCache, IEndpointCache, IPeerCache, ITicketCache } from "./cache";
import { IContent, IEndpoint, IPeer, LocalPeer, WSPeer } from "./cacheobject";
import { HMCache } from "./hmcache";
import { DLNLogger } from "./logger";
import { Ticket } from "./queryobjects";
import { HasherSHA256, IHasher } from "./hasher";



type AnyFn = (...args: unknown[]) => unknown
export type ClassProperties<C> = {
    [K in keyof C as C[K] extends AnyFn | ((m: any) => void)[] ? never : K]: C[K]
}

export class DLayerNode extends EventEmitter {
    //create optional proxy mirroring connection solution, hardwired
    //proxy access is just monitor mirror with trust access
    secret: string
    isDeployed: Boolean = false
    functionMap: Map<string, () => {}> = new Map()
    logger: DLNLogger = new DLNLogger(this)
    hasher: IHasher = HasherSHA256.GetInstance()
    contentCache: IContentCache<HMCache<IContent>> = new 
    IContentCache<HMCache<IContent>>(this.logger, new HMCache<IContent>())
    endpointCache: IEndpointCache<HMCache<IEndpoint>> = new 
    IEndpointCache<HMCache<IEndpoint>>(this.logger, new HMCache<IEndpoint>())
    peerCache: IPeerCache<HMCache<IPeer<any>>> = new IPeerCache<HMCache<IPeer<any>>>(this.logger, new HMCache<IPeer<any>>())
    ticketCache: ITicketCache<HMCache<Ticket>> = new ITicketCache<HMCache<Ticket>>(this.peerCache, this.logger, new HMCache<Ticket>())
    appInst: expressWs.Instance
    app: expressWs.Application
    port: number
    outboundAddressIPV6: string = ""
    bootstraps: string[]
    eat: boolean = false
    bowl: LocalPeer
    connectWS(urls: string[]) {
        urls.forEach((url, i) => {
            let wspeer = new WSPeer(this, this.peerCache, new WebSocket(url), url)
            this.peerCache.Connect(wspeer)
        })
    }
    handleDLNodeError(err: DLNodeErrorBase, rb: DLQueryBuilder){
        //log or pass build or decide what errors to nosend
        err.buildError(rb)
    }
    resolveResponse(message: DLQuery, rb: DLQueryBuilder, peer: IPeer<any>) {
        //let ticket = message.ticket
        this.logger.log(`resolve response`)
        switch(message.res!.status){
            case ResponseCodes.hit:
                
                this.ticketCache.ResolveTicket(message.ticket, message.res!, peer).catch((err) => {
                    if(err instanceof DLNodeErrorBase) {
                        let rbb = new DLQueryBuilder()
                        this.handleDLNodeError(err, rbb)
                        peer.Send(rbb)
                    }
                })
                rb.DLNoSend(`received hit from peer`)
                break
            default: 
                this.logger.log(`received response from ${peer.GetHost()}: ${JSON.stringify(message, null, 2)}`)
        }
    }
    resolveError(message: DLQuery, rb: DLQueryBuilder, context: DLQueryContext) {

    }

    resolveContentRequest(message: DLQuery, rb: DLQueryBuilder, peer: IPeer<any>) {
        //console.log(`received request ${JSON.stringify(message)}`)
        this.logger.log(`received request ${JSON.stringify(message)}`)
        rb.setType(QueryCodes.response).setReq(message.req!).setRes({status: ResponseCodes.info}).setMessage({
            text: "received request"
        }).setTicket(DLQueryBuilder.NoTicket)
        peer.Send(rb)
        this.contentCache.HasId(message.req!.contentHash.hash).then((e) =>{
            if(e){
            this.logger.log(`content hit: ${this.contentCache.Get([message.req!.contentHash.hash])}`)
            this.contentCache.Get([message.req!.contentHash.hash]).then((e) => {
                let rbb = new DLQueryBuilder()
                rbb.setRes(e[0].GenerateResponse()).setMessage({}).setReq(message.req!).setTicket(message.ticket)
                this.logger.log(`rbb ${JSON.stringify(rbb._generateNoValidate(), null, 3)}`)
                peer.Send(rbb)
            })

            }else{
                this.logger.log(`no hit, peer query`)

                try{
                    this.ticketCache.CreateTicket(peer, message.req!, message.ticket, rb, (e) => {
                        this.logger.log(`ticket created ${JSON.stringify(e, null, 2)}`)
                        let qbb = new DLQueryBuilder().from(message).setTicket(e.Get())
                        this.peerCache.QueryPeers(peer, qbb).catch((err) => {
                            if(err instanceof DLNodeErrorBase) {
                                let rbb = new DLQueryBuilder()
                                this.handleDLNodeError(err, rbb)
                                peer.Send(rbb)
                            }
                        })
                    })
                }catch(err) { 
                    if(err instanceof DLNodeErrorBase) {
                        let rbb = new DLQueryBuilder()
                        this.handleDLNodeError(err, rbb)
                        peer.Send(rbb)
                    }
                }
            }
        })
    }
    dlayer(req: DLQuery, rb: DLQueryBuilder, peer: IPeer<any>) {
        this.logger.log(`dlayer ${JSON.stringify(req, null, 2)}`)
        DLQueryBuilder.validate(req)
        this.logger.log(`validated request`)
        rb.setTicket(req.ticket)
        switch (req.type){
            case QueryCodes.request : 
                if(req.req?.hops && req.req.hops < 3){
                    this.resolveContentRequest(req, rb, peer)
                }else{
                    this.logger.log(`overhopped ${req.req?.hops != undefined ? 'true' : 'false'} && ${req.req!.hops! < 3 ? 'true' : 'false'}`)
                    rb.DLNoSend()
                }
                break
            case QueryCodes.response : 
                if(req.req?.hops != undefined && req.req.hops > -1){
                    this.logger.log(`pls resolve response`)
                    this.resolveResponse(req, rb, peer)
                }else{
                    this.logger.log(`overhopped ${req.req?.hops != undefined ? 'true' : 'false'} && ${req.req!.hops! > -1 ? 'true' : 'false'}`)
                    rb.DLNoSend()
                }
                break
        }
    }
    getStat() {
        const data = {
            contentCache: [...this.contentCache._accessor._cacheObjectHM.entries()].map((e, i) => {
                return {
                    key: e[0],
                    value: e[1]._fields.raw
                }

            }),
            peerCache: [...this.peerCache._accessor._cacheObjectHM.entries()].map((e, i) => {
                return {
                    key: e[0],
                    value: e[1]._fields.host
                }
            }),
            ticketCache: [...this.ticketCache._accessor._cacheObjectHM.entries()].map((e, i) => {
                return {
                    key: e[0],
                    value: e[1]._fields._ticket
                }
            }),
            port: this.port,
            secret: this.secret,
            log: this.logger._log,
            content: this.bowl._content
        }
        return data
    }
    

    listen(start: number) {
        portfinder.setBasePort(start)
        return portfinder.getPortPromise().then((p) => {
            this.port = p
            console.log(`start port ${start} claim port ${p}`)
            this.app.listen(p, () => {
                this.logger.log(`DLayer listening on port ${this.port}`)
            })
            return p
        })
        //if port is used, use next and return port
    }
    deploy() {
        return this.listen(this.port).then((e) => {
            console.log(`port after listen ${e}`)
            this.peerCache.Connect(this.bowl)
            return e
        })
    }
    bootstrapPeers() {
        this.bootstraps.forEach((e, i) => {
            let ax = axios.create({
                baseURL: `https://${e}`,
                timeout: 1000
            })
            ax.get('/bootstrap').then((res) => {
                res.data.peers.forEach((e0: any, i0: any) => {

                    this.peerCache.Connect(new WSPeer(this, this.peerCache, new WebSocket(`ws://${e0}`), `ws://${e0}`))
                })
            })
            this.peerCache.Connect(new WSPeer(this, this.peerCache, new WebSocket(`ws://${e}`), `ws://${e}`))
        })
    }
    constructor(port: number, secret: string = "secret", peers: string[] = [], bootstraps: string[] = []) {
        super()
        this.secret = secret
        this.port = port
        this.appInst = expressWs(express())
        this.app = this.appInst.app
        this.bootstraps = bootstraps
        this.bootstrapPeers()
        this.bowl = new LocalPeer(this, this.peerCache, this.secret)
        this.app.ws('/', (ws, req) => {
            let newPeer = new WSPeer(this, this.peerCache, ws, `ws://${req.socket.remoteAddress}:${req.socket.remotePort}`)
            if(req.socket.remoteAddress){

                this.peerCache.Connect(newPeer)
            }
            this.logger.log(`connection from ${req.socket.remoteAddress}:${req.socket.remotePort}`)

        })//create dl clearnet resolver
        this.app.ws('/test', (ws, req) => {
            ws.on('message', (data) => {
                this.logger.log('test endpoint')
            })
        })
        this.app.get('/bootstrap', (req, res) => {
            
            this.peerCache.GetAll().then((m) => {
                let peers = m.map((e, i) => {
                    return e._fields.host
                })
                res.send(peers)
            })
            
        })
    }
}