"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketLogger = exports.PeerLogger = exports.DLNLogger = exports.StaticLogger = exports.ILogger = exports.ILogging = void 0;
class ILogging {
}
exports.ILogging = ILogging;
class ILogger {
}
exports.ILogger = ILogger;
class StaticLogger extends ILogger {
    static GetStaticInstance() {
        return StaticLogger._instance;
    }
    constructor() {
        super();
        this._log = "";
        this._logHooks = [(m) => {
                this._log += m + "\n";
            },
            (m) => {
                console.log(m);
            }];
    }
    log(m) {
        this._logHooks.forEach((e, i) => {
            e(m);
        });
    }
    logHook(hook) {
        this._logHooks.push(hook);
    }
}
exports.StaticLogger = StaticLogger;
StaticLogger._instance = new StaticLogger();
class DLNLogger extends ILogger {
    constructor(dln) {
        super();
        this._log = "";
        this._logHooks = [(m) => {
                this._log += m + "\n";
            },
            (m) => {
                console.log(m);
            }];
        this._dln = dln;
    }
    log(m) {
        this._logHooks.forEach((e, i) => {
            e(`[localhost:${this._dln.port}]${m}`);
        });
    }
    logHook(hook) {
        this._logHooks.push(hook);
    }
}
exports.DLNLogger = DLNLogger;
class PeerLogger extends ILogger {
    constructor(peer, dlnLogger) {
        super();
        this._peer = peer;
        this._dlnLogger = dlnLogger;
    }
    log(m) {
        this._dlnLogger.log(`[${this._peer._fields.host}]: ${m}`);
    }
    logHook(hook) {
        this._dlnLogger.logHook(hook);
    }
}
exports.PeerLogger = PeerLogger;
class TicketLogger extends ILogger {
    constructor(ticket, dlnLogger) {
        super();
        this._ticket = ticket;
        this._dlnLogger = dlnLogger;
    }
    log(m) {
        this._dlnLogger.log(`[${this._ticket._peer._fields.host}]: ${m}\n`);
    }
    logHook(hook) {
        this._dlnLogger.logHook(hook);
    }
}
exports.TicketLogger = TicketLogger;
