"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DLMonitorLayerClient = void 0;
const zodschemas_1 = require("./zodschemas");
class DLMonitorLayerClient {
    reviver(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (value.dataType === 'Map') {
                return new Map(value.value);
            }
        }
        return value;
    }
    initClient(ws) {
        //ws.on('message', (msg) => {
        ws.addEventListener('message', (event) => {
            try {
                let parsed = zodschemas_1.DLMonitorResponseZ.parse(JSON.parse(event.data));
                switch (parsed.type) {
                    case "log":
                        console.log(`recieved log from ${ws.url}`);
                        this.handleLog(parsed.message);
                        break;
                    case "content":
                        this.handleContent(parsed.message);
                        break;
                    case "stat":
                        console.log('stat received');
                        console.log(JSON.stringify(parsed.message, null, 3));
                        this.handleStat(parsed.message);
                        break;
                }
            }
            catch (err) {
                console.log(err);
            }
        });
        ws.addEventListener("open", (event) => {
            this.openHook();
        });
        return ws;
    }
    constructor(url) {
        this.handleLog = (m) => { };
        this.handleContent = (m) => { };
        this.handleStat = (m) => { };
        this.openHook = () => { };
        this.url = url;
        this.socket = this.initClient(new WebSocket(this.url));
    }
}
exports.DLMonitorLayerClient = DLMonitorLayerClient;
