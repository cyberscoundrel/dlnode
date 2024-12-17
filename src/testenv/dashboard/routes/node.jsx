"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Node = exports.Tabs0 = exports.TextArea = exports.Tabs = void 0;
exports.default = ContentList;
const React = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const crypto_js_1 = __importDefault(require("crypto-js"));
const outline_1 = require("@heroicons/react/24/outline");
function ContentList(props) {
    return (<div>
        <ul role="list" className="divide-y divide-gray-100">
          {props.content.map((cnt) => (<li className="flex items-center justify-between gap-x-6 py-5">
              <div className="flex min-w-0 gap-x-4">
                <div className="min-w-0 flex-auto">
                  <p className="text-sm font-semibold leading-6 text-gray-900">{cnt.name}</p>
                </div>
              </div>
              <button className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                View
              </button>
            </li>))}
        </ul>
      </div>);
}
const tabs = [
    { name: 'Tab0', href: '#', current: true },
    { name: 'Tab1', href: '#', current: false },
];
function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}
const Tabs = () => {
    var _a;
    return (<div>
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
          <select id="tabs" name="tabs" defaultValue={(_a = tabs.find((tab) => tab.current)) === null || _a === void 0 ? void 0 : _a.name} className="block w-full rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500">
            {tabs.map((tab) => (<option key={tab.name}>{tab.name}</option>))}
          </select>
        </div>
        <div className="hidden sm:block">
          <nav aria-label="Tabs" className="flex space-x-4">
            {tabs.map((tab) => (<a key={tab.name} href={tab.href} aria-current={tab.current ? 'page' : undefined} className={classNames(tab.current ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:text-gray-700', 'rounded-md px-3 py-2 text-sm font-medium')}>
                {tab.name}
              </a>))}
          </nav>
        </div>
      </div>);
};
exports.Tabs = Tabs;
const TextArea = (props) => {
    return (<div>
            <div className="flex flex-row"><div className=" flex flex-row items-center mb-2 px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">{props.icon ? <props.icon className="size-4 mr-2"></props.icon> : <></>}{props.label}</div><exports.Tabs /></div>
            <textarea id="message" value={props.content} disabled className="block p-2.5 w-full min-h-[400px] text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"></textarea>
        </div>);
};
exports.TextArea = TextArea;
const Tabs0 = () => {
    var _a;
    return (<div>
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">
            Select a tab
          </label>
          {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
          <select id="tabs" name="tabs" defaultValue={(_a = tabs.find((tab) => tab.current)) === null || _a === void 0 ? void 0 : _a.name} className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm">
            {tabs.map((tab) => (<option key={tab.name}>{tab.name}</option>))}
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="mb-2 border-b border-gray-200">
            <nav aria-label="Tabs" className="-mb-px flex space-x-8">
              {tabs.map((tab) => (<a key={tab.name} href={tab.href} aria-current={tab.current ? 'page' : undefined} className={classNames(tab.current
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700', 'whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium')}>
                  {tab.name}
                </a>))}
            </nav>
          </div>
        </div>
      </div>);
};
exports.Tabs0 = Tabs0;
const InnerNode = (props) => {
    console.log('node reload');
    let [content, setContent] = React.useState('');
    let [stat, setStat] = React.useState('');
    let [ostat, setOStat] = React.useState();
    let [newPeer, setNewPeer] = React.useState('');
    let [cont, setCont] = React.useState('');
    let [ocont, setOCont] = React.useState();
    let [newCont, setNewCont] = React.useState('');
    let [contents, setContents] = React.useState([]);
    console.log(`log ${props.log} stat ${stat}`);
    function reviver(key, value) {
        if (typeof value === 'object' && value !== null) {
            if (value.dataType === 'Map') {
                return new Map(value.value);
            }
        }
        return value;
    }
    const addToLog = (m) => {
        console.log(`logging from hook${('' + m)}`);
        console.log(props.log);
        props.setLog(prevLog => prevLog + '>' + m + '\n');
        console.log(props.log);
    };
    React.useEffect(() => {
        console.log('setting hooks');
        props.node.handleContent = (m) => {
            setContent(prevContent => '>' + prevContent + JSON.stringify(m, null, 3) + '\n');
            setOCont(m);
        };
        props.node.handleLog = (m) => {
            addToLog(m);
        };
        props.node.handleStat = (m) => {
            setOStat(m);
        };
        getStat();
    }, []);
    const getStat = () => {
        props.node.socket.send(JSON.stringify({
            type: "stat"
        }));
    };
    const addCont = () => {
        if (newCont != '') {
            setContents([...contents, {
                    name: newCont
                }]);
            props.node.socket.send(JSON.stringify({
                type: 'addCont',
                message: {
                    cont: newCont
                }
            }));
        }
    };
    const requestCont = () => {
        console.log(`requestcont log is ${props.log}`);
        if (cont != '') {
            let hsh = crypto_js_1.default.SHA256(cont);
            console.log(`requesting ${cont}/${hsh.toString()}`);
            console.log(`log is ${props.log}`);
            props.node.socket.send(JSON.stringify({
                type: 'query',
                message: {
                    contentHash: {
                        hash: hsh.toString()
                    },
                    hops: 0
                }
            }));
        }
    };
    const setPeers = () => {
        let peerRegex = /ws:\/\/[a-zA-Z0-9\.\-]+(\:[0-9]+)?/;
        if (newPeer != '') {
            if (peerRegex.test(newPeer)) {
                props.node.socket.send(JSON.stringify({
                    type: 'addPeers',
                    message: {
                        peers: [newPeer]
                    }
                }));
            }
        }
    };
    const statreplacer = (key, value) => {
        if (key === 'log' || key === 'content' || key === 'debug') {
            return undefined;
        }
        return value;
    };
    React.useEffect(() => {
        console.log('stat change');
        console.log(stat);
        if (ostat) {
            let ost = ostat;
            setStat(JSON.stringify(ostat, statreplacer, 3));
            props.setLog(ost.log.replace(/^\[/gm, ">["));
            setCont(ost.content);
            setContents(ost.contentCache.map((v, i) => {
                return {
                    name: v.value
                };
            }));
        }
    }, [ostat]);
    React.useEffect(() => {
        console.log(`new ${props.node.url}`);
        return () => {
            console.log(`old ${props.node.url}`);
            props.node.handleContent = (m) => { };
            props.node.handleLog = (m) => { };
            props.node.handleStat = (m) => { };
        };
    }, [props.node]);
    return (<div>
            <exports.Tabs0></exports.Tabs0>
        <div className="grid grid-cols-2 gap-2">
            <div><div className="mb-2"><exports.Tabs></exports.Tabs></div><div className="h-[400px] p-2 overflow-y-scroll rounded-lg border border-dashed border-slate-400"><button className="p-4 mr-4 mt-4 rounded-md bg-slate-700 text-white justify-center" onClick={getStat}>getStat</button>
            <button className="p-4 mr-4 mt-4 rounded-md bg-slate-700 text-white justify-center" onClick={setPeers}>setPeers</button>
            <input type="text" className="block w-72 mr-4 mt-4 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={newPeer} onChange={(e) => {
            setNewPeer(e.target.value);
        }}></input>
            <button className="p-4 mr-4 mt-4 rounded-md bg-slate-700 text-white justify-center" onClick={requestCont}>get content</button>
            <input type="text" className="block mr-4 mt-4 w-72 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={cont} onChange={(e) => {
            setCont(e.target.value);
        }}></input>
            <button className="p-4 mr-4 mt-4 rounded-md bg-slate-700 text-white justify-center" onClick={addCont}>add content</button>
            <input type="text" className="block mr-4 mt-4 w-72 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" value={newCont} onChange={(e) => {
            setNewCont(e.target.value);
        }}></input>
            {contents.length ? <ContentList content={contents}></ContentList> : <></>}
            <button className="p-4 mr-4 mt-4 rounded-md bg-slate-700 text-white justify-center" onClick={() => {
            props.setLog(props.log + 'logtest');
        }}>logtest</button></div></div>
            
            <exports.TextArea icon={outline_1.InformationCircleIcon} label={'stat'} content={stat}></exports.TextArea>
            <exports.TextArea icon={outline_1.Bars3CenterLeftIcon} label={'log'} content={props.log}></exports.TextArea>
            <exports.TextArea icon={outline_1.CubeIcon} label={'content'} content={content}></exports.TextArea>
        </div></div>);
};
const Node = () => {
    console.log('outer node reload');
    let { nodeID } = (0, react_router_dom_1.useParams)();
    let [nodes, sideBarProps, setSideBarProps] = (0, react_router_dom_1.useOutletContext)();
    let nid = parseInt(nodeID);
    console.log(`nid ${nid}`);
    let node = nodes[nid];
    let [log, setLog] = React.useState('');
    React.useEffect(() => {
        console.log('why did log change');
        console.log(log);
    }, [log]);
    return (<div>
            <InnerNode node={node} key={nid} log={log} setLog={setLog}/>            
        </div>);
};
exports.Node = Node;
