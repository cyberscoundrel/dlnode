import { DLayerNode } from '../src/node';
import { IPeerCache } from '../src/cache';
import { ITicketCache } from '../src/cache';
import { RawContent, WSPeer } from '../src/cacheobject';
import { DLQueryBuilder, QueryCodes, ResponseCodes } from '../src/dlbuilder';
import WebSocket from 'ws';

describe('DLayerNode and Cache Methods', () => {
    let node1: DLayerNode;
    let node2: DLayerNode;
    let rawContent1: RawContent;
    let rawContent2: RawContent;

    beforeAll(() => {
        node1 = new DLayerNode(3000, 'secret1', [], []);
        node2 = new DLayerNode(3001, 'secret2', [], []);
        rawContent2 = new RawContent(node1.contentCache, 'text', 'hi');
        rawContent1 = new RawContent(node2.contentCache, 'text', 'hello');
        node1.contentCache._accessor._add(rawContent1.TransformToKey(), rawContent1);
        node2.contentCache._accessor._add(rawContent2.TransformToKey(), rawContent2);
        node1.connectWS(['ws://localhost:3001']);

    });
    

    
});

