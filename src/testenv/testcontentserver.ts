import express, { Express, Request, Response } from "express";
import axios from 'axios'
import path from 'path'
import crypto from 'crypto'
import portfinder from 'portfinder'
import expressWs from 'express-ws';
import WebSocket, { WebSocketServer } from 'ws';
import { DLayerNode } from "../dlnode";
import * as fs from 'fs'

export class TestEnvContentServer{
    node: DLayerNode
    app: Express = express()
    port: number
    constructor(port: number, secret: string = "secret", bootstraps: string[] = [], peers: string[] = []) {
        this.port = port
        this.node = new DLayerNode(port + 100, secret, bootstraps, peers)
        this.app.get('/content/:contentID', (req, res) => {
            res.sendFile(path.join(__dirname, 'content', req.params.contentID))
        })
    }
    addContentFile(cid: string){
        fs.readFile(path.join(__dirname, 'content', cid), (err, data) => {
            if(!err){
                this.node.contentMap.set(this.node.hash(data), `http://localhost:${this.port}/content/${cid}`)
            }
        })
    }
    listen(start: number) {
        portfinder.setBasePort(start)
        return portfinder.getPortPromise().then((p) => {
            this.port = p
            this.app.listen(p, () => {
                console.log(`DLayer listening on port ${this.port}`)
            })
            return p
        })
        
        //if port is used, use next and return port

    }
    deploy() {
        this.node.deploy()
        return this.listen(this.port)
    }
}