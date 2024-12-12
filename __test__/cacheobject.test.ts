import { ICache } from "../src/cache";
import { ICacheObject } from "../src/cacheobject";
import { IHasher, HasherSHA256 } from "../src/hasher";
import { HMCache } from "../src/hmcache";
import { ILogger } from "../src/logger";
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

    
}


describe("MockCache", () => {
    let mockLogger: MockLogger;
    let mockHasher: HasherSHA256;
    let mockAccessor: HMCache<MockCacheObject>;
    let mockCache: MockCache;

    beforeEach(() => {
        mockLogger = new MockLogger();
        mockHasher = HasherSHA256.GetInstance();
        mockAccessor = new HMCache<MockCacheObject>();
        mockCache = new MockCache(mockLogger, mockHasher, mockAccessor);
    });
    describe("MockCacheObject", () => {
        let mockCache: ICache<any, any>;
        let mockCacheObject: MockCacheObject;

        beforeEach(() => {
            mockCache = new MockCache(mockLogger, mockHasher, mockAccessor);
            mockCacheObject = new MockCacheObject(mockCache, "value1", "value2");
        });

        it("should have the correct cache", () => {
            expect(mockCacheObject._cache).toBe(mockCache);
        });

        it("should have the correct fields", () => {
            expect(mockCacheObject._fields.field1).toBe("value1");
            expect(mockCacheObject._fields.field2).toBe("value2");
        });

        it("should return the key fields", () => {
            const keyFields = mockCacheObject.GetKeyFields();
            expect(keyFields.field1).toBe("value1");
            expect(keyFields.field2).toBe("value2");
        });

        it("should return the fields", () => {
            const fields = mockCacheObject.GetFields();
            expect(fields.field1).toBe("value1");
            expect(fields.field2).toBe("value2");
        });

        it("should transform to key", () => {
            const key = mockCacheObject.TransformToKey();
            expect(key).toBe(mockHasher.Hash(JSON.stringify(mockCacheObject.GetKeyFields())));
        });

        it("should match key fields with overlap", () => {
            const object = { field1: "value1", field2: "value2" };
            const match = mockCacheObject.MatchKeyFields(object, true);
            expect(match).toBe(true);
        });

        it("should match key fields without overlap", () => {
            const object = { field1: "value1", field2: "value2" };
            const match = mockCacheObject.MatchKeyFields(object, false);
            expect(match).toBe(true);
        });
    });

    
});
