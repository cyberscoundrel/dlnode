"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalProtocol = exports.WSProtocol = exports.IProtocol = void 0;
const logger_1 = require("./logger");
const dlbuilder_1 = require("./dlbuilder");
const zodschemas_1 = require("./zodschemas");
const zod_1 = require("zod");
class IProtocol {
    constructor(logger) {
        this._logger = logger;
    }
    GetLogger() {
        return this._logger;
    }
}
exports.IProtocol = IProtocol;
class WSProtocol extends IProtocol {
    static GetInstance() {
        return WSProtocol._instance;
    }
    _initWS(peer) {
        this.GetLogger().log(`initializing socket with url ${peer._fields.host}`);
        peer._ws.on('message', (msg) => {
            let qb = new dlbuilder_1.DLQueryBuilder();
            try {
                this.GetLogger().log(`received message from ${peer._fields.host}: ${msg.toString()}`);
                let prsed = JSON.parse(msg.toString());
                let dmsg = zodschemas_1.DLQueryZ.parse(JSON.parse(msg.toString()));
                this.GetLogger().log(`psd content ${JSON.stringify(prsed, null, 2)}`);
                peer._dln.dlayer(dmsg, qb, peer);
            }
            catch (err) {
                this.GetLogger().log(`error in dlayer ${err}`);
                if (err instanceof dlbuilder_1.DLQueryBuilderError) {
                    this.GetLogger().log(`querybuilder error`);
                }
                else if (err instanceof zod_1.ZodError) {
                    this.GetLogger().log(`zod error`);
                    qb.DLError(dlbuilder_1.ErrorCodes.internalError, "zod validation error: message does not meet schema requirements", dlbuilder_1.DLQueryBuilder.NoTicket);
                }
            }
            this.GetLogger().log(`end of dlayer`);
            peer.Send(qb);
        });
        peer._ws.on('close', () => {
            this.GetLogger().log(`${peer._ws.url} disconnected`);
        });
        return peer._ws;
    }
    InitPeer(peer) {
        console.log(`init peer ${peer._fields.host}`);
        this._initWS(peer);
        peer.SetSend((m) => {
            peer._ws.send(JSON.stringify(m));
        });
    }
    constructor(logger) {
        super(logger);
    }
}
exports.WSProtocol = WSProtocol;
WSProtocol._instance = new WSProtocol(logger_1.StaticLogger.GetStaticInstance());
class LocalProtocol extends IProtocol {
    static GetInstance() {
        return LocalProtocol._instance;
    }
    InitPeer(peer) {
        peer.SetSend((m) => {
            peer.RunHooks(m);
        });
    }
    constructor(logger) {
        super(logger);
    }
}
exports.LocalProtocol = LocalProtocol;
LocalProtocol._instance = new LocalProtocol(logger_1.StaticLogger.GetStaticInstance());
