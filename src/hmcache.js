"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HMCache = void 0;
class HMCache {
    constructor() {
        this._cacheObjectHM = new Map();
    }
    _has(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this._getn([obj])).length > 0;
        });
    }
    _hasId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._cacheObjectHM.has(id);
        });
    }
    _getn(elms) {
        return __awaiter(this, void 0, void 0, function* () {
            let gatheredElms = [];
            elms.forEach((v0, k0) => {
                this._cacheObjectHM.forEach((v1, k1) => {
                    if (v1.MatchKeyFields(v0, false)) {
                        gatheredElms.push(v1);
                    }
                });
            });
            return gatheredElms;
        });
    }
    _getIds(elmIds) {
        return __awaiter(this, void 0, void 0, function* () {
            let gatheredElms = [];
            elmIds.forEach((v0, k0) => {
                if (this._cacheObjectHM.has(v0)) {
                    gatheredElms.push(this._cacheObjectHM.get(v0));
                }
            });
            return gatheredElms;
        });
    }
    _removeIds(elmIds) {
        return __awaiter(this, void 0, void 0, function* () {
            elmIds.forEach((v, k) => {
                this._cacheObjectHM.delete(v);
            });
        });
    }
    _removen(elms) {
        return __awaiter(this, void 0, void 0, function* () {
            elms.forEach((v, k) => {
                this._cacheObjectHM.forEach((v1, k1) => {
                    if (v1.MatchKeyFields(v, false)) {
                        this._cacheObjectHM.delete(k1);
                    }
                });
                //no more get generated
            });
        });
    }
    _add(key, elm) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                this._cacheObjectHM.set(key, elm);
                console.log(this._cacheObjectHM.size);
                resolve();
            });
        });
    }
    _iterate(cb) {
        return __awaiter(this, void 0, void 0, function* () {
            this._cacheObjectHM.forEach((v, k) => {
                if (cb) {
                    cb(v);
                }
            });
            return Promise.resolve();
        });
    }
}
exports.HMCache = HMCache;
