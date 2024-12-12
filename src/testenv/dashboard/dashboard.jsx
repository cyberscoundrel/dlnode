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
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const ReactDOM = __importStar(require("react-dom/client"));
const react_router_dom_1 = require("react-router-dom");
require("./style.css");
const root_jsx_1 = require("./routes/root.jsx");
const node_jsx_1 = require("./routes/node.jsx");
function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}
/*export const nodeLoader = (async (data: LoaderFunctionArgs) => {
  return clients[parseInt(data.params.nodeID!)]
}) satisfies LoaderFunction
export const rootLoader = (async () => {
  let navNodes: NavType[] = []
  clients.forEach((e, i) => {
    navNodes.push({
      name: e.url,
      href: `/node/${i}`,
      icon: HomeIcon,
      current: false
    })
    return navNodes
  })


}) satisfies LoaderFunction*/
//const clients: DLMonitorLayerClient[] = []
/*const navigation = [


    { name: 'Dashboard', href: '#', icon: HomeIcon, current: true },
    { name: 'Team', href: '#', icon: UsersIcon, current: false },
    { name: 'Projects', href: '#', icon: FolderIcon, current: false },
    { name: 'Calendar', href: '#', icon: CalendarIcon, current: false },
    { name: 'Documents', href: '#', icon: DocumentDuplicateIcon, current: false },
    { name: 'Reports', href: '#', icon: ChartPieIcon, current: false },
  ]
/*export const Sidebar = () => {
    return (<div className="lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
    {/* Sidebar component, swap this element with another sidebar if you like */ /*}
<div className="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-600 px-6 pb-4">
  <div className="flex h-16 shrink-0 items-center">
    <HomeIcon className="h-6 w-6 text-white"></HomeIcon>
  </div>
  <nav className="flex flex-1 flex-col">
    <ul role="list" className="flex flex-1 flex-col gap-y-7">
      <li>
        <ul role="list" className="-mx-2 space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className={classNames(
                  item.current
                    ? 'bg-indigo-700 text-white'
                    : 'text-indigo-200 hover:bg-indigo-700 hover:text-white',
                  'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6',
                )}
              >
                <item.icon
                  aria-hidden="true"
                  className={classNames(
                    item.current ? 'text-white' : 'text-indigo-200 group-hover:text-white',
                    'h-6 w-6 shrink-0',
                  )}
                />
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </li>

      <li className="mt-auto">
        <a
          href="#"
          className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-indigo-200 hover:bg-indigo-700 hover:text-white"
        >
          <Cog6ToothIcon
            aria-hidden="true"
            className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white"
          />
          Settings
        </a>
      </li>
    </ul>
  </nav>
</div>
</div>)
}*/
const router = (0, react_router_dom_1.createBrowserRouter)([
    {
        path: "/",
        element: <root_jsx_1.Root />,
        children: [{
                path: '/node/:nodeID',
                element: <node_jsx_1.Node />
            }]
    },
]);
document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");
    ReactDOM.createRoot(document.getElementById("app")).render(<div>
            <react_router_dom_1.RouterProvider router={router}/>
        </div>);
});
