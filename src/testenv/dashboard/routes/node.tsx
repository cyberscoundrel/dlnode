import * as React from "react";
import { useLoaderData, LoaderFunctionArgs, useParams, useOutletContext, useLocation } from "react-router-dom";
import { DLMonitorLayerClient } from "../../../monitorlayerclient";
import axios from "axios";
import CryptoJS from "crypto-js";
import { NavType } from "./root";
import { InformationCircleIcon,
    CubeIcon,
    Bars3CenterLeftIcon
    
 } from "@heroicons/react/24/outline";


type ContentType = {
    name: string
}

type ContentListPropType = {
    content: ContentType[]
}
  
  export default function ContentList(props: ContentListPropType) {
    return (
      <div>
        <ul role="list" className="divide-y divide-gray-100">
          {props.content.map((cnt) => (
            <li className="flex items-center justify-between gap-x-6 py-5">
              <div className="flex min-w-0 gap-x-4">
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-gray-900">{cnt.name}</p>
                </div>
              </div>
              <button
                className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                View
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  


export type TextAreaPropType = {
    label: string,
    content: string,
    icon?: React.ForwardRefExoticComponent<Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
        title?: string;
        titleId?: string;
    } & React.RefAttributes<SVGSVGElement>>

}
const tabs = [
    { name: 'Tab0', href: '#', current: true },
    { name: 'Tab1', href: '#', current: false },
  ]
  
  
  function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }
  export const Tabs = () => {
    return (
      <div>
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
          <select
            id="tabs"
            name="tabs"
            defaultValue={tabs.find((tab) => tab.current)?.name}
            className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          >
            {tabs.map((tab) => (
              <option key={tab.name}>{tab.name}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <nav aria-label="Tabs" className="flex space-x-4">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                aria-current={tab.current ? 'page' : undefined}
                className={classNames(
                  tab.current ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700',
                  'rounded-md px-3 py-2 text-sm font-medium',
                )}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </div>
      </div>
    )
  }
  
  

export const TextArea = (props: TextAreaPropType) => {
    return (
        <div>
            <div className="flex flex-row"><div className=" flex flex-row items-center mb-2 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{props.icon ? <props.icon className="size-4 mr-2"></props.icon> : <></>}{props.label}</div><Tabs /></div>
            <textarea id="message" value={props.content} disabled className="block p-2.5 w-full min-h-[400px] text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" ></textarea>
        </div>

    )

}

/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/

  
  export const Tabs0 = () => {
    return (
      <div>
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
          <select
            id="tabs"
            name="tabs"
            defaultValue={tabs.find((tab) => tab.current)?.name}
            className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            {tabs.map((tab) => (
              <option key={tab.name}>{tab.name}</option>
            ))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="mb-2 border-b border-gray-200">
            <nav aria-label="Tabs" className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <a
                  key={tab.name}
                  href={tab.href}
                  aria-current={tab.current ? 'page' : undefined}
                  className={classNames(
                    tab.current
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium',
                  )}
                >
                  {tab.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>
    )
  }
  
type InnerNodePropType = {
    node: DLMonitorLayerClient

}
const InnerNode = (props: InnerNodePropType) => {
    console.log('node reload')
    //let oldNode = React.useRef<DLMonitorLayerClient>()
    //let [nodes, sideBarPops, setSideBarProps] = useOutletContext<[DLMonitorLayerClient[], NavType[], React.Dispatch<React.SetStateAction<NavType[]>>]>()
    let [log, setLog] = React.useState<string>('')
    let [content, setContent] = React.useState<string>('')
    let [stat, setStat] = React.useState<string>('')
    let [ostat, setOStat] = React.useState<unknown>()
    let [newPeer, setNewPeer] = React.useState<string>('')
    let [cont, setCont] = React.useState<string>('')
    let [ocont, setOCont] = React.useState<unknown>()
    let [newCont, setNewCont] = React.useState<string>('')
    let [contents, setContents] = React.useState<ContentType[]>([])
    
    //console.log(`log ${log} stat ${stat}`)

    /*props.node.handleContent = (m: any) => {
        setContent(content + JSON.stringify(m, null, 3))
    }
    props.node.handleLog = (m: any) => {
        setLog(log + JSON.stringify(m, null, 3))
    }
    props.node.handleStat = (m: any) => {
        //console.log('set stat')
        //console.log(m)
        setStat(stat + JSON.stringify(m, null, 3))
        //setLog(log + m)
        
    }*/
    function reviver(key: string, value: any) {
        if(typeof value === 'object' && value !== null) {
            if (value.dataType === 'Map') {
            return new Map(value.value);
            }
        }
        return value;
    }
    /*function replacer(key: string, value: any) {
        if(value instanceof Map) {
          return {
            dataType: 'Map',
            value: Array.from(value.entries()), // or with spread: value: [...value]
          };
        } else {
          return value;
        }
    }*/
   
    React.useEffect(() => {
        console.log('setting hooks')
        props.node.handleContent = (m: any) => {
            setContent(content + JSON.stringify(m, null, 3).replace(/\n/g, "<br />"))
            setOCont(m)
        }
        props.node.handleLog = (m: any) => {
            setLog(log + JSON.stringify(m, null, 3).replace(/\n/g, "<br />"))
        }
        props.node.handleStat = (m: any) => {
            //console.log('set stat')
            //console.log(m)
            //setStat(stat + JSON.stringify(m, null, 3))
            setOStat(m)
            //setLog(log + m)
            
        }
        getStat()




    }, [])
    /*React.useEffect(() => {
        return () => {
            console.log('resetting hooks')
            props.node.handleContent = (m: any) => {}
            props.node.handleLog = (m: any) => {}
            props.node.handleStat = (m: any) => {}
        }
    })*/
    const getStat = () => {
        //console.log('get stat')
        props.node.socket.send(JSON.stringify({
            type: "stat"
        }))
        //setStat(stat + 'get stat')

    }
    const addCont = () => {
        if(newCont != ''){
            setContents([...contents, {
                name: newCont
            }])
            props.node.socket.send(JSON.stringify({
                type: 'addCont',
                message: {
                    cont: newCont
                }
            }))
        }
    }
    const requestCont = () => {
        if(cont != '') {
        let hsh = CryptoJS.SHA256(cont)
            props.node.socket.send(JSON.stringify({
                type: 'query',
                message: {
                    contentHash: {
                        hash: hsh.toString()
                    },
                    hops: 0
                }
            }))
        }
        
    }
    const setPeers = () => {
        let peerRegex = /ws:\/\/[a-zA-Z0-9\.\-]+(\:[0-9]+)?/
        if(newPeer != '') {
            if(peerRegex.test(newPeer)) {
                props.node.socket.send(JSON.stringify({
                    type: 'addPeers',
                    message: {
                        peers: [newPeer]
                    }
                }))
            }

        }
    }
    
    /*React.useEffect(() => {
        console.log('on reload')
        node.handleContent = (m: any) => {
            setContent(content + JSON.stringify(m))
        }
        node.handleLog = (m: any) => {
            setLog(log + JSON.stringify(m))
        }
        node.handleStat = (m: any) => {
            console.log('set stat')
            console.log(m)
            setStat(stat + JSON.stringify(m))
            setLog(log + m)
            
        }
        getStat()
    }, [])*/
    const statreplacer = (key: string, value: any) => {
        if(key === 'log' || key === 'content' || key === 'debug') {
            return undefined
        }
        return value
    }
    React.useEffect(() => {
        console.log('stat change')
        console.log(stat)
        if(ostat) {
            let ost = ostat as unknown & { 
                log: string 
                content: string
                contentCache: {key: string, value: string}[]
            }
            setStat(JSON.stringify(ostat, statreplacer, 3))
            setLog(ost.log)
            setCont(ost.content)
            //let ca: ContentType[] = []
            
            setContents(ost.contentCache.map((v, i) => {
                return {
                    name: v.value
                }
            }))
            /*if(ost && log == '') {
                setLog(ost.log)
            }
            if(ost && content == '') {
                setCont(ost.content)
            }*/
        }
            
    }, [ostat])
    React.useEffect(() => {
        //console.log(`oldstate ${oldNode.current?.url}`)
        console.log(`new ${props.node.url}`)
        return () => {
            console.log(`old ${props.node.url}`)
            props.node.handleContent = (m: any) => {}
            props.node.handleLog = (m: any) => {}
            props.node.handleStat = (m: any) => {}

        }
        //oldNode.current = props.node
    }, [props.node])

    return (
        <div>
            <Tabs0></Tabs0>
        <div className="grid grid-cols-2 gap-2">
            <div><div className="mb-2"><Tabs></Tabs></div><div className="h-[400px] p-2 overflow-y-scroll rounded-lg border border-dashed border-slate-400"><button className="p-4 mr-4 mt-4 rounded-md bg-slate-700 text-white justify-center" onClick={getStat}>getStat</button>
            <button className="p-4 mr-4 mt-4 rounded-md bg-slate-700 text-white justify-center" onClick={setPeers}>setPeers</button>
            <input type="text" className="block w-72 mr-4 mt-4 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={newPeer} onChange={(e) => {
                setNewPeer(e.target.value)
            }}></input>
            <button className="p-4 mr-4 mt-4 rounded-md bg-slate-700 text-white justify-center" onClick={requestCont}>get content</button>
            <input type="text" className="block mr-4 mt-4 w-72 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={cont} onChange={(e) => {
                setCont(e.target.value)
            }}></input>
            <button className="p-4 mr-4 mt-4 rounded-md bg-slate-700 text-white justify-center" onClick={addCont}>add content</button>
            <input type="text" className="block mr-4 mt-4 w-72 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={newCont} onChange={(e) => {
                setNewCont(e.target.value)
            }}></input>
            {contents.length ? <ContentList content={contents}></ContentList> : <></>}
            <button className="p-4 mr-4 mt-4 rounded-md bg-slate-700 text-white justify-center" onClick={() => {
                setLog(log + 'logtest')
            }}>logtest</button></div></div>
            
            <TextArea icon={InformationCircleIcon} label={'stat'} content={stat}></TextArea>
            <TextArea icon={Bars3CenterLeftIcon} label={'log'} content={log}></TextArea>
            <TextArea icon={CubeIcon} label={'content'} content={content}></TextArea>
        </div></div>
    )
}
export const Node = () => {
    console.log('node reload')
    let { nodeID } = useParams()
    //let oldID = React.useRef<string>(nodeID!)
    
    let [nodes, sideBarProps, setSideBarProps] = useOutletContext<[DLMonitorLayerClient[], NavType[], React.Dispatch<React.SetStateAction<NavType[]>>]>()
    /*let [log, setLog] = React.useState<string>('')
    let [content, setContent] = React.useState<string>('')
    let [stat, setStat] = React.useState<string>('')
    let [newPeer, setNewPeer] = React.useState<string>('')
    let [cont, setCont] = React.useState<string>('')*/
    let nid = parseInt(nodeID!)
    console.log(`nid ${nid}`)
    let node = nodes[nid]
    /*React.useEffect(() => {
        console.log(`oldstate ${oldID.current}`)
        console.log(`newstate ${nodeID}`)
        nodes[parseInt(nodeID!)].
        oldID.current = nodeID!
    }, [nodeID])*/
    //let loc  = useLocation()
    //console.log(`log ${log} stat ${stat}`)

    /*node.handleContent = (m: any) => {
        setContent(content + JSON.stringify(m))
    }
    node.handleLog = (m: any) => {
        setLog(log + JSON.stringify(m))
    }
    node.handleStat = (m: any) => {
        console.log('set stat')
        console.log(m)
        setStat(stat + JSON.stringify(m))
        setLog(log + m)
        
    }
    /*React.useEffect(() => {
        return () => {
            console.log('resetting hooks')
            node.handleContent = (m: any) => {}
            node.handleLog = (m: any) => {}
            node.handleStat = (m: any) => {}
        }
    })*/
    /*React.useEffect(() => {
        //manually change states, update current node

        setLog('please rerender' + log)
        console.log('please rerender')
    }, [loc, node])*/
    /*const getStat = () => {
        console.log('get stat')
        node.socket.send(JSON.stringify({
            type: "stat"
        }))
        setStat(stat + 'get stat')

    }
    const requestCont = () => {
        if(cont != '') {
        let hsh = CryptoJS.SHA256(cont)
            node.socket.send(JSON.stringify({
                type: 'query',
                message: {
                    contentHash: {
                        hash: hsh.toString()
                    }
                }
            }))
        }
        
    }
    const setPeers = () => {
        let peerRegex = /ws:\/\/[a-zA-Z0-9\.\-]+(\:[0-9]+)?/
        if(newPeer != '') {
            if(peerRegex.test(newPeer)) {
                node.socket.send(JSON.stringify({
                    type: 'addPeers',
                    message: {
                        peers: [newPeer]
                    }
                }))
            }

        }
    }
    
    /*React.useEffect(() => {
        console.log('on reload')
        node.handleContent = (m: any) => {
            setContent(content + JSON.stringify(m))
        }
        node.handleLog = (m: any) => {
            setLog(log + JSON.stringify(m))
        }
        node.handleStat = (m: any) => {
            console.log('set stat')
            console.log(m)
            setStat(stat + JSON.stringify(m))
            setLog(log + m)
            
        }
        getStat()
    }, [])*/
    /*React.useEffect(() => {
        console.log('stat change')
        console.log(stat)
    }, [stat])*/

    return (
        <div>
            <InnerNode node={node} key={nid} />            
        </div>
    )
}