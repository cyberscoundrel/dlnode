import { CacheAccessor } from "./cache"
import { ICacheObject } from "./cacheobject"

export class HMCache<T extends ICacheObject> implements CacheAccessor<T> {

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
