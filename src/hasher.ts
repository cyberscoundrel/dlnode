import * as crypto from 'crypto';
export abstract class IHashing {
    abstract GetHashAlg(): IHasher
}
export abstract class IHasher{
    abstract Hash(o: any): string
    static _instance: IHasher
    static GetInstance(): IHasher {
        return this._instance
    }
}
export class HasherSHA256 extends IHasher {
    Hash(o: any): string {
        let sha = crypto.createHash('sha256')
        sha.update('' + o)
        return sha.digest('hex')
    }
    static _instance: IHasher = new HasherSHA256()
    static GetInstance(): IHasher {
        return this._instance
    }
    private constructor(){
        super()
    }
}