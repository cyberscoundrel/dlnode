import {z} from 'zod'

export const DLRequestZ = z.object({
    contentHash: z.object({
        hash:z.string()/*hash of content, required in body of contentHash*/
    }),
    hops: z.number()
})
export const DLResponseZ = z.object({
    status: z.number(),
    content: z.optional(z.array(z.any()))
})
export const DLQueryTicketZ = z.object({
    txn: z.string(),
    recipient: z.optional(z.string()),
    origin: z.optional(z.object({
        encryptedOrigin: z.string()/*public encryption keys listed on blockchain with certs and child certs, if i have a cert from the org whos public key encrypts, i can see the origin*/
    })),
    
})
export const DLMessageZ = z.object({
    text: z.optional(z.string()),
    error: z.optional(z.number())
})
export const DLQueryZ = z.object({
    type: z.number(),
    req: z.optional(DLRequestZ),
    res: z.optional(DLResponseZ),
    ticket: DLQueryTicketZ,
    message: DLMessageZ
})
export const DLMonitorRequestZ = z.object({
    type: z.string(),
    message: z.optional(z.any())
})
export const DLMonitorResponseZ = z.object({
    type: z.string(),
    message: z.any()
})

export type DLRequest = z.infer<typeof DLRequestZ>
export type DLResponse = z.infer<typeof DLResponseZ>
export type DLQuery = z.infer<typeof DLQueryZ>
export type DLQueryTicket = z.infer<typeof DLQueryTicketZ>
export type DLMessage = z.infer<typeof DLMessageZ>
export type DLMonitorRequest = z.infer<typeof DLMonitorRequestZ>
export type DLMonitorResponse = z.infer<typeof DLMonitorResponseZ>
