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
exports.Root = exports.Sidebar = exports.Input = void 0;
const React = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
const outline_1 = require("@heroicons/react/24/outline");
const monitorlayerclient_1 = require("../../../monitorlayerclient");
const axios_1 = __importDefault(require("axios"));
function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}
const Input = (props) => {
    return (<div className='flex flex-row -mx-2'>
        <div className="mt-2 flex rounded-md shadow-sm mr-2">
          <span className="bg-slate-50 inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-2 text-gray-500 sm:text-sm">
            ws://
          </span>
          <input onChange={props.onField} id="company-website" name="company-website" type="text" placeholder="localhost:1234" value={props.field} className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-0 pl-2 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-16"/>
        </div>
          <button onClick={props.onAdd} className='mt-2 px-2 text-gray-500 sm:text-sm rounded-md bg-slate-200'>Add</button>
      </div>);
};
exports.Input = Input;
const Sidebar = (props) => {
    return (<div className="lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
    {/* Sidebar component, swap this element with another sidebar if you like */}
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <a href='/'>
          <outline_1.HomeIcon className="h-6 w-6 text-white"></outline_1.HomeIcon>
        </a>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <exports.Input onAdd={props.onAdd} field={props.field} onField={props.onField}/>
          </li>
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {props.elements.map((item) => (<li key={item.name}>
                  <react_router_dom_1.Link to={item.href} className={classNames(item.current
                ? 'bg-indigo-700 text-white'
                : 'text-indigo-200 hover:bg-indigo-700 hover:text-white', 'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6')}>
                    <item.icon aria-hidden="true" className={classNames(item.current ? 'text-white' : 'text-indigo-200 group-hover:text-white', 'h-6 w-6 shrink-0')}/>
                    {item.name}
                  </react_router_dom_1.Link>
                </li>))}
            </ul>
          </li>

          <li className="mt-auto">
            <s><a href="#" className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-indigo-200 hover:bg-indigo-700 hover:text-white">
              <outline_1.Cog6ToothIcon aria-hidden="true" className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white"/>
              Settings
            </a></s>
          </li>
        </ul>
      </nav>
    </div>
  </div>);
};
exports.Sidebar = Sidebar;
const Root = () => {
    const [nodes, setNodes] = React.useState([]);
    const [elements, setElements] = React.useState([]);
    let [field, setField] = React.useState('');
    React.useEffect(() => {
        let elms = [];
        nodes.forEach((e, i) => {
            elms.push({
                name: e.url,
                href: `/node/${i}`,
                icon: outline_1.ArrowUpCircleIcon,
                current: false
            });
        });
        setElements(elms);
    }, [nodes]);
    React.useEffect(() => {
        console.log('get all node urls');
        axios_1.default.get('/instances').then((res) => {
            console.log(res.data);
            let newNodes = res.data.map((e, i) => {
                return new monitorlayerclient_1.DLMonitorLayerClient(e);
            });
            console.log(newNodes.length);
            console.log(newNodes.map(e => e.socket.readyState));
            console.log(newNodes.map(e => e.url));
            setNodes([...nodes, ...newNodes]);
            console.log(nodes.length);
            console.log(nodes.map(e => e.socket.url));
            console.log(nodes);
        }).catch((err) => {
            console.log('no stat message');
        });
    }, []);
    const handleAdd = () => {
        let dlm = new monitorlayerclient_1.DLMonitorLayerClient(`ws://${field}`);
        setNodes([...nodes, dlm]);
    };
    const handleField = (event) => {
        setField(event.target.value);
    };
    return (<div>
        <exports.Sidebar elements={elements} field={field} onAdd={handleAdd} onField={handleField}></exports.Sidebar>
        <div className='ml-72 p-8'>
          <react_router_dom_1.Outlet context={[nodes, setElements]}/>
        </div>
    </div>);
};
exports.Root = Root;
