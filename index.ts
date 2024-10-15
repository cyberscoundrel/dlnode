import {DLayerNode} from './src/dlnode'

let nodes: DLayerNode[] = []
Array.from(Array(25)).forEach((e, i) => {
    nodes.push(new DLayerNode(3030, `secret${i}`))
    nodes[i].deploy()
})