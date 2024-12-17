import express from 'express'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import { DLayerNode } from '../../node'
import { DLMonitorLayer } from '../../monitorlayer'
import path from 'path'
import portfinder from 'portfinder'
import webpack from 'webpack'
const webpackConfig = require('../../../webpack.config.js');
const config = {
    networkConfig: {
        labels: ['a', 'b', 'c', 'd', 'e'/*, 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l'*/],
        config: {
            'a': {
                peers: ['b']
            },
            'b': {
                peers: ['c']
            },
            'c': {
                peers: ['d']
            },
            'd': {
                peers: ['e']
            }
            /*'a': {
                peers: ['b', 'c']
            },
            'b': {
                peers: ['d', 'e', 'g']
            },
            'c': {
                peers: ['d', 'f', 'g']
            },
            'd': {
                peers: ['h', 'i']
            },
            'e': {
                peers: ['i', 'j']
            },
            'f': {
                peers: ['k', 'j']
            },
            'g': {
                peers: ['j', 'd', 'l']
            },
            'k': {
                peers: ['a', 'c']
            },
            'i': {
                peers: ['b', 'd']
            }*/
        } as any
    }
}

const randomPeers = (size: number, peerCount: number) => {
    nodes.forEach((e, i) => {
        e.connectWS(Array.from(Array(peerCount)).map((v, i) => {
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
            if(config.networkConfig.config[config.networkConfig.labels[i]].peers){
                let p = config.networkConfig.config[config.networkConfig.labels[i]].peers as string[]
                p.forEach((em, ind) => {
                    let n = config.networkConfig.labels.indexOf(em)
                    console.log(`add peer ws://localhost:${nodes[n].port}`)
                    e.connectWS([`ws://localhost:${nodes[n].port}`])
                })
            }
            if(config.networkConfig.config[config.networkConfig.labels[i]].eat){
                e.eat = true
            }
        }
    })
}
const testEnvWithConfig = () => {
    testEnv(config.networkConfig.labels.length, -1, () => peerSetupWithConfig())
}
const nodes: DLayerNode[] = []
const mnodes: DLMonitorLayer[] = []
const app = express()

const compiler = webpack(webpackConfig);

app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath,
}));

app.use(webpackHotMiddleware(compiler));

/*app.get('/', (req, res) => {
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
})*/
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

/*function webpack(webpackConfig: any) {
    throw new Error('Function not implemented.')
}*/

