import express from 'express'
import { DLayerNode } from '../../dlnode'
import { DLMonitorLayer } from '../../monitorlayer'
import path from 'path'
import portfinder from 'portfinder'
const testEnv = (size: number = 25, peerCount: number = 5) => {
    let dc = size - 1
    Array.from(Array(size)).forEach((e, i) => {
        console.log(`pushing server with target port ${3030 + i}`)
        console.log(`index ${i}`)
        nodes.push(new DLayerNode(3030 + i, `secret${i}`))
        nodes[i].deploy().then((p) => {
            console.log(`passed port ${p}`)
            console.log(`depoloying monitor for localhost:${p}`)
            let peerCount = 5
            mnodes.push(new DLMonitorLayer(p + 100, nodes[i]))
            dc -= 1
            if(dc == 0) {
                console.log(`peers time`)
                nodes.forEach((e, i) => {
                    e.addPeers(Array.from(Array(peerCount)).map((v, i) => {
                        return `ws://localhost:${nodes[Math.floor(Math.random() * size - 0.01)].port}`
                    }))

                })
            }
        })
        
    })
}
const nodes: DLayerNode[] = []
const mnodes: DLMonitorLayer[] = []
const app = express()

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})
app.get('/bundle.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'bundle.js'))
})
app.get('/bundle.js.map', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'bundle.js.map'))
})
app.get('/output.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'output.css'))
})
app.get('/instances', (req, res) => {
    res.send(JSON.stringify(mnodes.map((v, i) => {
        return `ws://localhost:${v.port}`
    })))
})
testEnv()
portfinder.setBasePort(3000)
let pf = portfinder.getPortPromise().then((port) => {
    app.listen(port, () => {
        console.log(`dashboard backend listening on ${port}`)
    })
})

