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
                                console.log(`queried hash ${query.contentHash.hash}`)
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        text: `queried hash ${query.contentHash.hash}`
                                    }
                                }, null, 3))
                            }catch(err){
                                console.log(err)
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        error: '' + err
                                    }
                                }, null, 3))

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
                                }, null, 3))
                            }catch(err){
                                console.log(err)
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        error: '' + err
                                    }
                                }, null, 3))

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
                                }, null, 3))


                            } catch(err) {
                                console.log(err)
                                ws.send(JSON.stringify({
                                    type: "log",
                                    message: {
                                        error: '' + err
                                    }
                                }, null, 3))
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
                    }, null, 3))

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
                        message: m
                    }, null, 3))
                })
            })
            this.dln.logger.logHook((m) => {
                this.wss?.clients.forEach((e, i) => {
                    e.send(JSON.stringify({
                        type: "log",
                        message: `${m}`
                    }, null, 3))
                })
            })
            
        })
    }
}

