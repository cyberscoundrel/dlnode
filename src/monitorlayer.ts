import { DLayerNode } from "./node";
import WebSocket, { WebSocketServer } from 'ws';
import portfinder from 'portfinder'
import { DLMonitorRequestZ, DLMonitorResponseZ, DLQueryZ, DLRequestZ } from "./zodschemas";
import type { DLMonitorRequest, DLMonitorResponse } from "./zodschemas";
import { IContent } from "./cacheobject";
//integrate into dlnode? with trust vs auth
export class DLMonitorLayer{
    dln: DLayerNode
    //create type that abstracts either raw dln object or proxy mirror connection
    //proxy mirror is just relay to monitor with restricted trust
    wss?: WebSocketServer
    port: number
    replacer(key: any, value: any) {
        if(value instanceof Map) {
          return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
          };
        } else {
          return value;
        }
    }
    initServer(wss: WebSocketServer): WebSocketServer{
        wss.on('connection', (ws) => {
            ws.on('message', (msg) => {
                try{
                    let parsed = DLMonitorRequestZ.parse(JSON.parse(msg.toString()))
                    switch(parsed.type){
                        case "stat": 
                            console.log('stat request')
                            console.log(JSON.stringify({
                                type: "stat",
                                message: {
                                    ...this.dln.getStat()
                                }
                            },this.replacer,3))
                            ws.send(JSON.stringify({
                                type: "stat",
                                message: {
                                    ...this.dln.getStat(),
                                }
                            },this.replacer))
                            break
                        case "query": 
                            try{
                                let query = DLRequestZ.parse(parsed.message!)
                                this.dln.bowl.RequestContent(query.contentHash.hash, query.hops)
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        text: `queried hash ${query.contentHash.hash}`
                                    }
                                }))
                            }catch(err){
                                console.log(err)
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        error: '' + err
                                    }
                                }))

                            }
                            break
                        case "addCont": 
                            try {
                                let newCont = parsed.message!.cont as string
                                
                                let rawCont = this.dln.contentCache.AddRawContent(newCont)
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        text: `added content ${newCont}: ${rawCont.TransformToKey()}`
                                    }
                                }))
                            }catch(err){
                                console.log(err)
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        error: '' + err
                                    }
                                }))

                            }
                            break
                        case "addPeers":
                            try{
                                let newPeers = parsed.message!.peers as string[]
                                newPeers.forEach((e, i) => {
                                    this.dln.connectWS([e])
                                })
                                
                                ws.send(JSON.stringify({
                                    type: "stat",
                                    message: {
                                        ...this.dln.getStat()
                                    }
                                }))


                            } catch(err) {
                                console.log(err)
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        error: '' + err
                                    }
                                }))
                            }
                            break
                    }
                }catch(err){
                    console.log(err)
                    ws.send(JSON.stringify({
                        type: "log",
                        message: {
                            error: '' + err
                        }
                    }))

                }

            })
        })
        return wss
    }//constructor option for original dlnode http server
    //to directly implement monitor layer to dlnode for remote management with one http server instance with authentication
    constructor(port: number, dln: DLayerNode) {
        this.dln = dln
        this.port = port
        portfinder.setBasePort(port)
        portfinder.getPortPromise().then((p) => {
            this.port = p
            this.wss = new WebSocket.Server({
                port: p
            })
            console.log(`motitor layer server listening on port ${p} for node localhost${dln.port}`)
            this.initServer(this.wss)
            this.dln.bowl.AddHook((m) => {
                this.wss?.clients.forEach((e, i) => {
                    e.send(JSON.stringify({
                        type: "content",
                        message: `${m}\n`
                    }))
                })
            })
            this.dln.logger.logHook((m) => {
                //console.log(`monitor log hook`)
                this.wss?.clients.forEach((e, i) => {
                    e.send(JSON.stringify({
                        type: "log",
                        message: `${m}\n`
                    }))
                })
            })
            /*this.dln.contentHook((m) => {
                this.wss?.clients.forEach((e, i) => {
                    e.send(JSON.stringify({
                        type: "content",
                        message: m
                    }))
                })
            })
            this.dln.logHook((m) => {
                //console.log(`monitor log hook`)
                this.wss?.clients.forEach((e, i) => {
                    e.send(JSON.stringify({
                        type: "log",
                        message: m
                    }))
                })
            })*/
        })
    }
}

/*export class DLMonitorLayerClient{
    url: string
    socket: WebSocket
    handleLog: (m: any) => void = (m: any) => {}
    handleContent: (m: any) => void = (m: any) => {}
    initClient(ws: WebSocket): WebSocket {
        ws.on('message', (msg) => {
            try{
                let parsed = DLMonitorResponseZ.parse(msg)
                switch(parsed.type) {
                    case "log": this.handleLog(parsed.message)
                        break
                    case "content": this.handleContent(parsed.message)
                        break
                }
            }catch(err){
                console.log(err)
            }

        })
        return ws
    }
    constructor(url: string) {
        this.url = url
        this.socket = this.initClient(new WebSocket(this.url))
    }
}*/