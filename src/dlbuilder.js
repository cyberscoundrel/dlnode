"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _DLQueryBuilder_partial;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DLQueryBuilder = exports.DLInternalError = exports.InternalError = exports.DLQueryBuilderError = exports.DLNodeErrorBase = exports.ErrorCodes = exports.ResponseCodes = exports.QueryCodes = void 0;
var QueryCodes;
(function (QueryCodes) {
    QueryCodes[QueryCodes["nosend"] = -1] = "nosend";
    QueryCodes[QueryCodes["request"] = 0] = "request";
    //execute = 1,
    QueryCodes[QueryCodes["response"] = 2] = "response";
})(QueryCodes || (exports.QueryCodes = QueryCodes = {}));
var ResponseCodes;
(function (ResponseCodes) {
    ResponseCodes[ResponseCodes["nosend"] = -1] = "nosend";
    ResponseCodes[ResponseCodes["hit"] = 0] = "hit";
    ResponseCodes[ResponseCodes["ticket"] = 1] = "ticket";
    ResponseCodes[ResponseCodes["error"] = 2] = "error";
})(ResponseCodes || (exports.ResponseCodes = ResponseCodes = {}));
var ErrorCodes;
(function (ErrorCodes) {
    ErrorCodes[ErrorCodes["genericError"] = -1] = "genericError";
    ErrorCodes[ErrorCodes["invalidRequest"] = 0] = "invalidRequest";
    ErrorCodes[ErrorCodes["invalidResponse"] = 1] = "invalidResponse";
    ErrorCodes[ErrorCodes["generationError"] = 2] = "generationError";
    ErrorCodes[ErrorCodes["internalError"] = 3] = "internalError";
})(ErrorCodes || (exports.ErrorCodes = ErrorCodes = {}));
class DLNodeErrorBase extends Error {
    constructor(msg) {
        super(msg);
    }
}
exports.DLNodeErrorBase = DLNodeErrorBase;
class DLQueryBuilderError extends DLNodeErrorBase {
    constructor(msg, txt, errCode, context, ticket, partial) {
        super(msg);
        this.code = errCode;
        this.txt = txt,
            this.partial = partial;
        this.context = context;
        this.ticket = ticket;
    }
    buildError(rb) {
        rb.DLError(this.code, this.txt, this.ticket ? this.ticket : DLQueryBuilder.NoTicket);
    }
}
exports.DLQueryBuilderError = DLQueryBuilderError;
var InternalError;
(function (InternalError) {
    InternalError[InternalError["ticketCreation"] = 0] = "ticketCreation";
})(InternalError || (exports.InternalError = InternalError = {}));
class DLInternalError extends DLNodeErrorBase {
    constructor(msg, txt, errCode, tkt, context) {
        super(msg);
        this.txt = txt;
        this.errCode = errCode;
        this.tkt = tkt;
        this.context = context;
    }
    buildError(rb) {
        rb.DLError(ErrorCodes.internalError, this.txt);
    }
}
exports.DLInternalError = DLInternalError;
class DLQueryBuilder {
    constructor() {
        _DLQueryBuilder_partial.set(this, {
            type: QueryCodes.nosend,
            req: undefined,
            res: undefined,
            ticket: undefined,
            message: undefined
        });
    }
    from(req) {
        __classPrivateFieldSet(this, _DLQueryBuilder_partial, Object.assign(Object.assign({}, __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f")), req), "f");
        return this;
    }
    setType(qc) {
        __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").type = qc;
        return this;
    }
    getType() {
        return __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").type;
    }
    setReq(req) {
        __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").req = req;
        return this;
    }
    getReq() {
        return __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").req;
    }
    setRes(res) {
        __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").res = res;
        return this;
    }
    getRes() {
        return __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").res;
    }
    setMessage(message) {
        __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").message = message;
        return this;
    }
    getMessage() {
        return __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").message;
    }
    setTicket(ticket) {
        __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").ticket = ticket;
        return this;
    }
    getTicket() {
        return __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").ticket;
    }
    _generateNoValidate() {
        let newQuery = {
            type: __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").type,
            req: __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").req,
            res: __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").res,
            ticket: __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").ticket,
            message: __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").message
        };
        return newQuery;
    }
    generate() {
        try {
            DLQueryBuilder.validate(__classPrivateFieldGet(this, _DLQueryBuilder_partial, "f"));
        }
        catch (e) {
            if (e instanceof DLQueryBuilderError) {
                this.DLError(e.code, e.txt);
            }
            else {
                this.DLError(ErrorCodes.generationError, "generation error with no specifics");
            }
        }
        let newQuery = {
            type: __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").type,
            req: __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").req,
            res: __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").res,
            ticket: __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").ticket,
            message: __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f").message
        };
        return newQuery;
    }
    static validate(dlq, code = ErrorCodes.generationError) {
        if (dlq.type == QueryCodes.nosend) {
            return;
        }
        if (dlq.req || dlq.res) {
            if (dlq.message) {
                switch (dlq.type) {
                    case QueryCodes.request:
                        if (dlq.req) {
                            if (dlq.ticket) {
                                if (!dlq.ticket.txn) {
                                    throw new DLQueryBuilderError("no txn provided", "no txn provided", code);
                                }
                                if (!dlq.req.contentHash) {
                                    throw new DLQueryBuilderError("no content hash provided in request", "no content hash provided in request", code);
                                }
                            }
                            else {
                                throw new DLQueryBuilderError("no ticket provided", "no ticket provided", code);
                            }
                        }
                        else {
                            throw new DLQueryBuilderError("no request provided ", "no request provided", code);
                        }
                        break;
                    case QueryCodes.response:
                        if (dlq.res) {
                            if (dlq.res.status != undefined) {
                                if (dlq.ticket && dlq.ticket.txn) {
                                    switch (dlq.res.status) {
                                        case ResponseCodes.hit:
                                            if (dlq.ticket.txn == "000") {
                                                throw new DLQueryBuilderError("no txn provided for hit", "no txn provided for hit", code);
                                            }
                                            break;
                                        case ResponseCodes.error:
                                            if (!dlq.message.error) {
                                                throw new DLQueryBuilderError("no error code provided for error response", "no error code provided for error response", code);
                                            }
                                            break;
                                    }
                                }
                                else {
                                    throw new DLQueryBuilderError("no ticket provided in response", "no ticket provided in response", code);
                                }
                            }
                            else {
                                throw new DLQueryBuilderError("no status provided", "no status provided", code);
                            }
                        }
                        else {
                            throw new DLQueryBuilderError("no response provided", "no response provided", code);
                        }
                        break;
                }
            }
            else {
                throw new DLQueryBuilderError("no message provided in query", "no message provided in query", code);
            }
        }
        else {
            throw new DLQueryBuilderError("no request or response provided", "no request or response provided", code);
        }
    }
    DLError(err = ErrorCodes.generationError, txt = "generic error", tkt = DLQueryBuilder.NoTicket) {
        __classPrivateFieldSet(this, _DLQueryBuilder_partial, Object.assign(Object.assign({}, __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f")), { type: QueryCodes.response, res: {
                status: ResponseCodes.error
            }, ticket: tkt, message: {
                text: txt,
                error: err
            } }), "f");
        return this;
    }
    DLNoSend(txt = "generic no send") {
        __classPrivateFieldSet(this, _DLQueryBuilder_partial, Object.assign(Object.assign({}, __classPrivateFieldGet(this, _DLQueryBuilder_partial, "f")), { type: QueryCodes.nosend, ticket: DLQueryBuilder.NoTicket, message: {
                text: txt
            } }), "f");
        return this;
    }
}
exports.DLQueryBuilder = DLQueryBuilder;
_DLQueryBuilder_partial = new WeakMap();
DLQueryBuilder.NoTicket = {
    txn: "000"
};
