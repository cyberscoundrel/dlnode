import WebSocket, { WebSocketServer } from 'ws';
import { IPeer, LocalPeer, WSPeer } from "./cacheobject"
import { DLNLogger, ILogger, ILogging, StaticLogger } from "./logger"
import { DLQueryBuilder, DLQueryBuilderError, ErrorCodes } from './dlbuilder';
import { DLQueryZ } from './zodschemas';
import { ZodError } from 'zod';


export abstract class IProtocol<P extends IPeer<any>> implements ILogging{
    _logger: ILogger
    abstract InitPeer(peer: P): void 
    constructor(logger: ILogger) {
        this._logger = logger
    }
    GetLogger(): ILogger {
        return this._logger
    }



}
export class WSProtocol extends IProtocol<WSPeer> {
    static _instance: WSProtocol = new WSProtocol(StaticLogger.GetStaticInstance())
    static GetInstance(){
        return WSProtocol._instance
    }
    _initWS(peer: WSPeer){
        //console.log(`initializing socket with url ${remoteAddress}`)
        this.GetLogger().log(`initializing socket with url ${peer._fields.host}`)
        peer._ws.on('message',(msg) => {
            let qb: DLQueryBuilder = new DLQueryBuilder()
            
            /*let context = {
                reply:(m: any) => ws.send(m),
                socketID: this.Hash(remoteAddress),
                socket: remoteAddress
            }*/
            try{
                this.GetLogger().log(`received message from ${peer._fields.host}: ${msg.toString()}`)
                let prsed = JSON.parse(msg.toString())
                let dmsg = DLQueryZ.parse(JSON.parse(msg.toString()))
                this.GetLogger().log(`psd content ${JSON.stringify(prsed, null, 2)}`)
                peer._dln.dlayer(dmsg, qb, peer)
                //this.dlayer(dmsg, qb, context)
            }catch(err){

                this.GetLogger().log(`error in dlayer ${err}`)
                if(err instanceof DLQueryBuilderError){
                    this.GetLogger().log(`querybuilder error`)
                    //this.handleDLNodeError(err, qb)
                }else if(err instanceof ZodError){
                    this.GetLogger().log(`zod error`)
                    qb.DLError(ErrorCodes.internalError, "zod validation error: message does not meet schema requirements", DLQueryBuilder.NoTicket)
                }
            }
            this.GetLogger().log(`end of dlayer`)
            peer.Send(qb)
            //peer._filterSend(qb)
        })
        peer._ws.on('close',() => {
            this.GetLogger().log(`${peer._ws.url} disconnected`)
            //this.socketTearDown(peer._ws.url)
        })
        return peer._ws
        
    }
    InitPeer(peer: WSPeer): void {
        console.log(`init peer ${peer._fields.host}`)
        this._initWS(peer)
        peer.SetSend((m: any) => {
            peer._ws.send(JSON.stringify(m))
        })
        //dln.initWS()
    }
    constructor(logger: ILogger){
        super(logger)
    }
}
export class LocalProtocol extends IProtocol<LocalPeer> {
    static _instance: LocalProtocol = new LocalProtocol(StaticLogger.GetStaticInstance())
    static GetInstance(){
        return LocalProtocol._instance
    }

    InitPeer(peer: LocalPeer): void {
        peer.SetSend((m: any) => {
            peer.RunHooks(m)
        })
    }
    constructor(logger: ILogger){
        super(logger)
    }
}