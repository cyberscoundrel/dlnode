import { IPeer } from "./cacheobject"
import { DLayerNode } from "./node"
import { Ticket } from "./queryobjects"

export abstract class ILogging {
    
    abstract GetLogger(): ILogger 

}

export abstract class ILogger {
    abstract log(m: any): void
    abstract logHook(hook: (m: any) => void): void
}

export class StaticLogger extends ILogger {
    _logHooks: ((m: any) => void)[]
    _log: string
    static _instance: StaticLogger = new StaticLogger()
    static GetStaticInstance(){
        return StaticLogger._instance
    }
    private constructor(){
        super()
        this._log = ""
        this._logHooks = [(m: any) => {
            this._log += m + "\n"
        },
        (m: any) => {
            console.log(m)
        }]
    }
    log(m: any){
        this._logHooks.forEach((e, i) => {
            e(m)
        })
    }
    logHook(hook: (m: any) => void){
        this._logHooks.push(hook)
    }
}

export class DLNLogger extends ILogger {
    _logHooks: ((m: any) => void)[]
    _log: string
    _dln: DLayerNode

    constructor(dln: DLayerNode){
        super()
        this._log = ""
        this._logHooks = [(m: any) => {
            this._log += m + "\n"
        },
        (m: any) => {
            console.log(m)
        }]
        this._dln = dln
        
    }
    log(m: any){
        this._logHooks.forEach((e, i) => {
            e(`[localhost:${this._dln.port}]${m}`)
        })
    }
    logHook(hook: (m: any) => void){
        this._logHooks.push(hook)
    }
}
export class PeerLogger extends ILogger {
    _dlnLogger: ILogger
    _peer: IPeer<any>
    constructor(peer: IPeer<any>, dlnLogger: ILogger){
        super()
        this._peer = peer
        this._dlnLogger = dlnLogger
    }
    log(m: any){
        this._dlnLogger.log(`[${this._peer._fields.host}]: ${m}`)
    }
    logHook(hook: (m: any) => void){
        this._dlnLogger.logHook(hook)
    }
}
export class TicketLogger extends ILogger {
    _dlnLogger: DLNLogger
    _ticket: Ticket
    constructor(ticket: any, dlnLogger: DLNLogger){
        super()
        this._ticket = ticket
        this._dlnLogger = dlnLogger
    }
    log(m: any){
        this._dlnLogger.log(`[${this._ticket._peer._fields.host}]: ${m}\n`)
    }
    logHook(hook: (m: any) => void){
        this._dlnLogger.logHook(hook)
    }
}