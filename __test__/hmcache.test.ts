import { HMCache } from "../src/hmcache";
import { ICacheObject } from "../src/cacheobject";
import { CacheAccessor, ICache } from "../src/cache";
import { ILogger } from "../src/logger";
import { HasherSHA256, IHasher } from "../src/hasher";
// Define a mock implementation of ICacheObject
class MockCacheObject extends ICacheObject {
    _cache: ICache<any, any>;
    _fields: {
        field1: string;
        field2: string;
    }

    constructor(cache: ICache<any, any>, field1: string, field2: string) {
        super()
        this._cache = cache;
        this._fields = {
            field1: field1,
            field2: field2
        };
    }



}
class MockLogger extends ILogger {
    _logHooks: ((m: any) => void)[];
    _log: string;
    constructor(){
        super()
        this._log = ""
        this._logHooks = [(m: any) => {
            this._log += m
        },
        (m: any) => {
            console.log(m)
        }]

        
    }
    log(m: any){
        this._logHooks.forEach((e, i) => {
            e(`[mock logger]${m}`)
        })
    }
    logHook(hook: (m: any) => void){
        this._logHooks.push(hook)
    }
}
class MockCache extends ICache<MockCacheObject, HMCache<MockCacheObject>> {
    constructor(logger: ILogger, hasher: IHasher, accessor: HMCache<MockCacheObject>) {
        super(logger, hasher, accessor)
    }

    /*async _add(key: string, element: MockCacheObject) {
        this._cacheObjectHM.set(key, element);
    }

    async _has(element: MockCacheObject): Promise<boolean> {
        return Array.from(this._cacheObjectHM.values()).includes(element);
    }

    async _hasId(key: string): Promise<boolean> {
        return this._cacheObjectHM.has(key);
    }

    async _getn(elements: MockCacheObject[]): Promise<MockCacheObject[]> {
        return elements.filter(e => this._cacheObjectHM.has(e._cache.GetHashAlg().Hash(e._fields.field1 + e._fields.field2)));
    }

    async _getIds(keys: string[]): Promise<MockCacheObject[]> {
        return keys.map(k => this._cacheObjectHM.get(k));
    }

    async _removeIds(keys: string[]): Promise<void> {
        keys.forEach(k => this._cacheObjectHM.delete(k));
    }

    async _removen(elements: MockCacheObject[]): Promise<void> {
        elements.forEach(e => this._cacheObjectHM.delete(e._cache.GetHashAlg().Hash(e._fields.field1 + e._fields.field2)));
    }

    async _iterate(callback: (element: MockCacheObject) => void): Promise<void> {
        this._cacheObjectHM.forEach(e => callback(e));
    }*/
}


describe("HMCache", () => {
    let cache: MockCache
    let logger: MockLogger
    let hasher: IHasher

    beforeEach(() => {
        logger = new MockLogger();
        hasher = HasherSHA256.GetInstance();
        cache = new MockCache(logger, hasher, new HMCache<MockCacheObject>());
    });

    it("should add an element to the cache", async () => {
        const element = new MockCacheObject(cache, "test0", "test0a");

        await cache._accessor._add(element.TransformToKey(), element);

        console.log(cache._accessor._cacheObjectHM.size)

        expect(cache._accessor._cacheObjectHM.has(element.TransformToKey())).toBe(true);
        expect(cache._accessor._cacheObjectHM.get(element.TransformToKey())).toBe(element);
    });

    it("should check if an element exists in the cache by object", async () => {
        const element = new MockCacheObject(cache, "test1", "test1a");

        await cache._accessor._add(element.TransformToKey(), element);

        console.log(cache._accessor._cacheObjectHM.size)

        const exists = await cache._accessor._has(element.GetKeyFields());

        expect(exists).toBe(true);
    });

    it("should check if an element exists in the cache by ID", async () => {
        const element = new MockCacheObject(cache, "test2", "test2a");

        await cache._accessor._add(element.TransformToKey(), element);

        const exists = await cache._accessor._hasId(element.TransformToKey());

        expect(exists).toBe(true);
    });

    it("should get multiple elements from the cache by objects", async () => {
        const element1 = new MockCacheObject(cache, "test3", "test3a");
        const element2 = new MockCacheObject(cache, "test4", "test4a");

        await cache._accessor._add(element1.TransformToKey(), element1);
        await cache._accessor._add(element2.TransformToKey(), element2);

        const elements = await cache._accessor._getn([element1.GetKeyFields(), element2.GetKeyFields()]);

        expect(elements).toContain(element1);
        expect(elements).toContain(element2);
    });

    it("should get multiple elements from the cache by IDs", async () => {
        const element1 = new MockCacheObject(cache, "test5", "test5a");
        const element2 = new MockCacheObject(cache, "test6", "test6a");

        await cache._accessor._add(element1.TransformToKey(), element1);
        await cache._accessor._add(element2.TransformToKey(), element2);

        const elements = await cache._accessor._getIds([element1.TransformToKey(), element2.TransformToKey()]);

        expect(elements).toContain(element1);
        expect(elements).toContain(element2);
    });

    it("should remove multiple elements from the cache by IDs", async () => {
        const element1 = new MockCacheObject(cache, "test7", "test7a");
        const element2 = new MockCacheObject(cache, "test8", "test8a");

        await cache._accessor._add(element1.TransformToKey(), element1);
        await cache._accessor._add(element2.TransformToKey(), element2);

        await cache._accessor._removeIds([element1.TransformToKey(), element2.TransformToKey()]);

        expect(cache._accessor._cacheObjectHM.has(element1.TransformToKey())).toBe(false);
        expect(cache._accessor._cacheObjectHM.has(element2.TransformToKey())).toBe(false);
    });

    it("should remove multiple elements from the cache by objects", async () => {
        const element1 = new MockCacheObject(cache, "test9", "test9a");
        const element2 = new MockCacheObject(cache, "test10", "test10a");

        await cache._accessor._add(element1.TransformToKey(), element1);
        await cache._accessor._add(element2.TransformToKey(), element2);

        await cache._accessor._removen([element1.GetKeyFields(), element2.GetKeyFields()]);

        expect(cache._accessor._cacheObjectHM.has(element1.TransformToKey())).toBe(false);
        expect(cache._accessor._cacheObjectHM.has(element2.TransformToKey())).toBe(false);
    });

    it("should iterate over all elements in the cache", async () => {
        const element1 = new MockCacheObject(cache, "test11", "test11a");
        const element2 = new MockCacheObject(cache, "test12", "test12a");

        await cache._accessor._add(element1.TransformToKey(), element1);
        await cache._accessor._add(element2.TransformToKey(), element2);

        const callback = jest.fn();

        await cache._accessor._iterate(callback);

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenCalledWith(element1);
        expect(callback).toHaveBeenCalledWith(element2);
    });
});