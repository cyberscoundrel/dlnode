import express from 'express'
import { DLayerNode } from '../../dlnode'
import { DLMonitorLayer } from '../../monitorlayer'
import path from 'path'
import portfinder from 'portfinder'
const config = {
    networkConfig: {
        labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
        config: {
            'a': {
                peers: ['b', 'c']
            },
            'b': {
                peers: ['d', 'e', 'g']
            },
            'c': {
                peers: ['d', 'f', 'g']
            }
        } as any
    }
}

const randomPeers = (size: number, peerCount: number) => {
    nodes.forEach((e, i) => {
        e.addPeers(Array.from(Array(peerCount)).map((v, i) => {
            return `ws://localhost:${nodes[Math.floor(Math.random() * size - 0.01)].port}`
        }))

    })

}
const testEnv = (size: number = 25, peerCount: number = 5, peerSetup: (...args: any[]) => void = randomPeers) => {
    let dc = size
    Array.from(Array(size)).forEach((e, i) => {
        console.log(`pushing server with target port ${3030 + i}`)
        console.log(`index ${i}`)
        nodes.push(new DLayerNode(3030 + i, `secret${i}`))
        nodes[i].deploy().then((p) => {
            console.log(`passed port ${p}`)
            console.log(`depoloying monitor for localhost:${p}`)
            mnodes.push(new DLMonitorLayer(p + 100, nodes[i]))
            dc -= 1
            if(dc == 0) {
                console.log(`peers time`)
                peerSetup(size, peerCount)
            }
        })
        
    })
}
const peerSetupWithConfig = () => {
    console.log('peerSetupWithConfig')
    nodes.forEach((e, i) => {
        if(config.networkConfig.config[config.networkConfig.labels[i]]){
            let p = config.networkConfig.config[config.networkConfig.labels[i]].peers as string[]
            p.forEach((em, ind) => {
                let n = config.networkConfig.labels.indexOf(em)
                console.log(`add peer ws://localhost:${nodes[n].port}`)
                e.addPeer(`ws://localhost:${nodes[n].port}`)
            })
        }
    })
}
const testEnvWithConfig = () => {
    testEnv(config.networkConfig.labels.length, -1, () => peerSetupWithConfig())
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
testEnvWithConfig()
//testEnv()
portfinder.setBasePort(3000)
let pf = portfinder.getPortPromise().then((port) => {
    app.listen(port, () => {
        console.log(`dashboard backend listening on ${port}`)
    })
})
