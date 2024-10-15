"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DLMonitorResponseZ = exports.DLMonitorRequestZ = exports.DLQueryZ = exports.DLMessageZ = exports.DLQueryTicketZ = exports.DLResponseZ = exports.DLRequestZ = void 0;
const zod_1 = require("zod");
exports.DLRequestZ = zod_1.z.object({
    contentHash: zod_1.z.object({
        hash: zod_1.z.string() /*hash of content, required in body of contentHash*/
    }),
    hops: zod_1.z.number()
});
exports.DLResponseZ = zod_1.z.object({
    status: zod_1.z.number(),
    content: zod_1.z.optional(zod_1.z.array(zod_1.z.object({})))
});
exports.DLQueryTicketZ = zod_1.z.object({
    txn: zod_1.z.string(),
    recipient: zod_1.z.optional(zod_1.z.string()),
    origin: zod_1.z.optional(zod_1.z.object({
        encryptedOrigin: zod_1.z.string() /*public encryption keys listed on blockchain with certs and child certs, if i have a cert from the org whos public key encrypts, i can see the origin*/
    })),
});
exports.DLMessageZ = zod_1.z.object({
    text: zod_1.z.optional(zod_1.z.string()),
    error: zod_1.z.optional(zod_1.z.number())
});
exports.DLQueryZ = zod_1.z.object({
    type: zod_1.z.number(),
    req: zod_1.z.optional(exports.DLRequestZ),
    res: zod_1.z.optional(exports.DLResponseZ),
    ticket: exports.DLQueryTicketZ,
    message: exports.DLMessageZ
});
exports.DLMonitorRequestZ = zod_1.z.object({
    type: zod_1.z.string(),
    message: zod_1.z.optional(zod_1.z.any())
});
exports.DLMonitorResponseZ = zod_1.z.object({
    type: zod_1.z.string(),
    message: zod_1.z.any()
});
