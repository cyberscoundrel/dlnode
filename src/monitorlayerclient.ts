import { DLMonitorResponseZ } from "./zodschemas"


export class DLMonitorLayerClient{
    url: string
    socket: WebSocket
    handleLog: (m: any) => void = (m: any) => {}
    handleContent: (m: any) => void = (m: any) => {}
    handleStat: (m: any) => void = (m: any) => {}
    openHook: () => any = () => {}
    initClient(ws: WebSocket): WebSocket {
        //ws.on('message', (msg) => {
        ws.addEventListener('message', (event) => {
            try{
                let parsed = DLMonitorResponseZ.parse(JSON.parse(event.data))
                switch(parsed.type) {
                    case "log": 
                        console.log(`recieved log from ${ws.url}`)
                        this.handleLog(parsed.message)
                        break
                    case "content": this.handleContent(parsed.message)
                        break
                    case "stat": 
                        console.log('stat received')
                        console.log(JSON.stringify(parsed.message, null, 3))
                        this.handleStat(parsed.message)
                        break
                }
            }catch(err){
                console.log(err)
            }

        })
        ws.addEventListener("open", (event) => {
            this.openHook()
          });
        return ws
    }
    constructor(url: string) {
        this.url = url
        this.socket = this.initClient(new WebSocket(this.url))
    }
}