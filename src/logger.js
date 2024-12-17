"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketLogger = exports.PeerLogger = exports.DLNLogger = exports.StaticLogger = exports.ILogger = exports.ILogging = void 0;
class ILogging {
}
exports.ILogging = ILogging;
class ILogger {
    constructor() {
        this._flairs = [
            (options) => {
                if ((options === null || options === void 0 ? void 0 : options.timestamp) === false) {
                    return "";
                }
                const now = new Date();
                const timeString = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const milliseconds = now.getMilliseconds().toString().padStart(3, '0');
                return `[${timeString}.${milliseconds}]`;
            }
            /*() => {
                return "[INFO]"
            },
            () => {
                return "[WARN]"
            },
            () => {
                return "[ERROR]"
            }*/
        ];
    }
    log(m, options) {
        let flair = this._flairs.reduce((acc, e) => {
            return `${acc}${e(options)}`;
        }, '');
        this._logg(`${flair}${m}`);
    }
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
    _logg(m) {
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
    _logg(m) {
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
    _logg(m) {
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
    _logg(m) {
        this._dlnLogger.log(`[${this._ticket._peer._fields.host}]: ${m}\n`);
    }
    logHook(hook) {
        this._dlnLogger.logHook(hook);
    }
}
exports.TicketLogger = TicketLogger;
