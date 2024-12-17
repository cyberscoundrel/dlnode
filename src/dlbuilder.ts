
import express, { Express, Request, Response } from "express";
import axios from 'axios'
import path from 'path'
import crypto from 'crypto'
import portfinder from 'portfinder'
import expressWs from 'express-ws';
import WebSocket, { WebSocketServer } from 'ws';
import {z} from 'zod'
import type { DLQuery, DLRequest, DLResponse, DLQueryTicket, DLMessage } from "./zodschemas";
import { DLQueryZ, DLRequestZ, DLResponseZ, DLMessageZ } from "./zodschemas";
export enum QueryCodes {
    nosend = -1,
    request = 0,
    //execute = 1,
    response = 2,
}
export enum ResponseCodes {
    nosend = -1,
    hit = 0,
    ticket = 1,
    error = 2,
    info = 3
}
export enum ErrorCodes {
    genericError = -1,
    invalidRequest = 0,
    invalidResponse = 1,
    generationError = 2,
    internalError = 3
}


export abstract class DLNodeErrorBase extends Error{
    constructor(msg: string){
        super(msg)
    }
    abstract buildError(rb: DLQueryBuilder): void
}
export class DLQueryBuilderError extends DLNodeErrorBase{
    code: ErrorCodes
    txt: string
    partial?: Partial<DLQuery>
    context?: DLQueryContext
    ticket?: DLQueryTicket
    constructor(msg: string, txt: string, errCode: ErrorCodes, context?: DLQueryContext, ticket?: DLQueryTicket, partial?: Partial<DLQuery>) {
        super(msg)
        this.code = errCode
        this.txt = txt,
        this.partial = partial
        this.context = context
        this.ticket = ticket
    }
    buildError(rb: DLQueryBuilder){
        rb.DLError(this.code, this.txt, this.ticket? this.ticket : DLQueryBuilder.NoTicket)
    }
}
export type DLQueryContext = {
    reply: (m: any) => void
    socketID?: string
    socket?: string
}
export enum InternalError {
    ticketCreation = 0
}
export class DLInternalError extends DLNodeErrorBase{
    txt: string
    errCode: InternalError
    tkt?: DLQueryTicket
    context?: DLQueryContext
    constructor(msg: string, txt: string, errCode: InternalError, tkt?: DLQueryTicket, context?: DLQueryContext){
        super(msg)
        this.txt = txt
        this.errCode = errCode
        this.tkt = tkt
        this.context = context
    }
    buildError(rb: DLQueryBuilder){
        rb.DLError(ErrorCodes.internalError, this.txt)
    }

}
export class DLQueryBuilder {
    #partial: Partial<DLQuery> = {
        type: QueryCodes.nosend,
        req: undefined,
        res: undefined,
        ticket: undefined,
        message: undefined
    }
    static NoTicket: DLQueryTicket = {
        txn: "000"
    }
    from(req: Partial<DLQuery>) {
        this.#partial = {
            ...this.#partial,
            ...req
        }
        return this
    }
    setType(qc: QueryCodes) {
        this.#partial.type = qc
        return this
    }
    getType(){
        return this.#partial.type
    }
    setReq(req: DLRequest) {
        this.#partial.req = req
        return this
    }
    getReq(){
        return this.#partial.req
    }
    setRes(res: DLResponse) {
        this.#partial.res = res
        return this
    }
    getRes(){
        return this.#partial.res
    }
    setMessage(message: DLMessage) {
        this.#partial.message = message
        return this
    }
    getMessage(){
        return this.#partial.message
    }
    setTicket(ticket: DLQueryTicket) {
        this.#partial.ticket = ticket
        return this
    }
    getTicket() {
        return this.#partial.ticket
    }
    _generateNoValidate(): DLQuery{
        let newQuery: DLQuery = {
            type: this.#partial.type!,
            req: this.#partial.req,
            res: this.#partial.res,
            ticket: this.#partial.ticket!,
            message: this.#partial.message!
        }
        return newQuery
    }
    generate(): DLQuery{
        try{
            DLQueryBuilder.validate(this.#partial)
        }catch(e){
            if(e instanceof DLQueryBuilderError) {
                this.DLError(e.code, e.txt)
            }else{
                this.DLError(ErrorCodes.generationError, "generation error with no specifics")
            }
        }
        let newQuery: DLQuery = {
            type: this.#partial.type!,
            req: this.#partial.req,
            res: this.#partial.res,
            ticket: this.#partial.ticket!,
            message: this.#partial.message!
        }
        return newQuery
    }
    static validate(dlq: Partial<DLQuery>, code: ErrorCodes = ErrorCodes.generationError){
        if(dlq.type == QueryCodes.nosend){
            return
        }
        if(dlq.req || dlq.res){
            if(dlq.message){
                switch(dlq.type) {
                    case QueryCodes.request:
                        if(dlq.req){
                            if(dlq.ticket){
                                if(!dlq.ticket.txn){
                                    throw new DLQueryBuilderError("no txn provided", "no txn provided", code)
                                }
                                if(!dlq.req.contentHash){
                                    throw new DLQueryBuilderError("no content hash provided in request", "no content hash provided in request", code)
                                }
                            }else{
                                throw new DLQueryBuilderError("no ticket provided", "no ticket provided", code)
                            }

                        }else{
                            throw new DLQueryBuilderError("no request provided ", "no request provided", code)
                        }
                        break
                    case QueryCodes.response:
                        if(dlq.res){
                            if(dlq.res.status != undefined){
                                
                                if(dlq.ticket && dlq.ticket.txn){
                                    switch(dlq.res.status){
                                        case ResponseCodes.hit:
                                            if(dlq.ticket.txn == "000"){
                                                throw new DLQueryBuilderError("no txn provided for hit", "no txn provided for hit", code)
                                            }
                                            break
                                        case ResponseCodes.error:
                                            if(!dlq.message.error){
                                                throw new DLQueryBuilderError("no error code provided for error response", "no error code provided for error response", code)
                                            }
                                            break
                                    }
                                    
                                }else{
                                    throw new DLQueryBuilderError("no ticket provided in response", "no ticket provided in response", code)
                                }

                            }else{
                                throw new DLQueryBuilderError("no status provided", "no status provided", code)
                            }

                        }else{
                            throw new DLQueryBuilderError("no response provided", "no response provided", code)
                        }
                        break
                }
            }else{
                throw new DLQueryBuilderError("no message provided in query", "no message provided in query", code)
            }
        }else{
            throw new DLQueryBuilderError("no request or response provided", "no request or response provided", code)
        }
    }
    DLError(err: ErrorCodes = ErrorCodes.generationError, txt: string = "generic error", tkt: DLQueryTicket = DLQueryBuilder.NoTicket){
        this.#partial =  { 
            ...this.#partial,
            type: QueryCodes.response,
            res: {
                status: ResponseCodes.error
            },
            ticket: tkt,
            message: {
                text: txt,
                error: err
            }
        }
        return this
    }
    DLNoSend(txt: string = "generic no send"){
        this.#partial =  {
            ...this.#partial,
            type: QueryCodes.nosend,
            ticket: DLQueryBuilder.NoTicket,
            message: {
                text: txt
            }
        }
        return this

    }

}