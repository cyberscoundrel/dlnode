import { CacheAccessor } from "./cache"
import { ICacheObject } from "./cacheobject"

export class HMCache<T extends ICacheObject> implements CacheAccessor<T> {
    /*_has(key: string): boolean {
        return this._cacheObjectHM.has(key)
    
    }  */
    async _has(obj: Record<string, unknown>): Promise<boolean> {
        return (await this._getn([obj])).length > 0
    }
    async _hasId(id: string): Promise<boolean> {
        return this._cacheObjectHM.has(id)
    }
    async _getn(elms: Record<string, unknown>[]): Promise<T[]> {
        let gatheredElms: T[] = []

       elms.forEach((v0, k0) => {
            this._cacheObjectHM.forEach((v1, k1) => {
                    if(v1.MatchKeyFields(v0, false)){
                        gatheredElms.push(v1)
                    }
            }
       )})
        
                
                
        

        return gatheredElms
    }
    async _getIds(elmIds: string[]): Promise<T[]> {
        let gatheredElms: T[] = []
        elmIds.forEach((v0, k0) => {
            if(this._cacheObjectHM.has(v0)){
                gatheredElms.push(this._cacheObjectHM.get(v0)!)
            }
        })
        return gatheredElms
    }
    async _removeIds(elmIds: string[]): Promise<void> {
        elmIds.forEach((v, k) => {
            this._cacheObjectHM.delete(v)
        })
    }
    async _removen(elms: Record<string, unknown>[]): Promise<void> {
        elms.forEach((v, k) => {
            this._cacheObjectHM.forEach((v1, k1) => {
                if(v1.MatchKeyFields(v, false)){
                    this._cacheObjectHM.delete(k1)
                }
            })
            //no more get generated
        })
    }
    async _add(key: string, elm: T): Promise<void> {
        return new Promise((resolve, reject) => {
            this._cacheObjectHM.set(key, elm)
            console.log(this._cacheObjectHM.size)
            resolve()
        })

    }
    async _iterate(cb?: ((t: T) => void) | undefined): Promise<void> {
        this._cacheObjectHM.forEach((v, k) => {
            if(cb){
                cb(v)
            }
        })
        return Promise.resolve()
    }
    _cacheObjectHM: Map<string, T> = new Map()
}
/*export type HMBinnedIndex = {
    bin: string
    index: string
}
export class HMBinnedCache<T extends IBinnedCacheObject> {
    _has(obj: unknown): boolean {
        return this._getn([obj]).length > 0
    }
    _getn(elms: unknown[]): T[] {
        let gatheredElms: T[] = []

       elms.forEach((v0, k0) => {
            this._cacheObjectHM.forEach((v1, k1) => {
                    v1.forEach((v2, k2) => {
                        if(v2.MatchKeyFields(v0, false)){
                            gatheredElms.push(v2)
                        }
                    })
            }
       )})
        
                
                
        

        return gatheredElms
    }
    _getIds(elmIds: HMBinnedIndex[]): T[] {
        let gatheredElms: T[] = []
        elmIds.forEach((v0, k0) => {
            if(this._cacheObjectHM.has(v0.bin)){
                let bin = this._cacheObjectHM.get(v0.bin)!
                if(bin.has(v0.index)){
                    gatheredElms.push(bin.get(v0.index)!)
                }
            }
            
        })
        return gatheredElms
    }
    _removeIds(elmIds: HMBinnedIndex[]): void {
        elmIds.forEach((v, k) => {
            if(this._cacheObjectHM.has(v.bin)){
                let bin = this._cacheObjectHM.get(v.bin)!
                if(bin.has(v.index)){
                    bin.delete(v.index)
                }
            }
        })
        
    }
    _removen(elms: unknown[]): void {
        elms.forEach((v, k) => {
            this._cacheObjectHM.forEach((v1, k1) => {
                v1.forEach((v2, k2) => {
                    if(v2.MatchKeyFields(v, false)){
                        v1.delete(k2)
                    }
                })
            })
        })
    }
    _add(key: HMBinnedIndex, elm: T): void {
        this._cacheObjectHM.set(key.bin, new Map()).get(key.bin)!.set(key.index, elm)
    }
    _iterate(cb?: ((t: T) => {}) | undefined): Promise<void> {
        this._cacheObjectHM.forEach((v, k) => {
            v.forEach((v1, k1) => {
                if(cb){
                    cb(v1)
                }
            })
        })
        return Promise.resolve()
    }
    _cacheObjectHM: Map<string, Map<string, T>> = new Map()

}*/