import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  LoaderFunction,
  LoaderFunctionArgs,
  RouterProvider,
} from "react-router-dom";
import './style.css'
import { Root, NavType } from "./routes/root.jsx";
import { Node } from "./routes/node.jsx"
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
export type LoaderData<TLoaderFn extends LoaderFunction> = Awaited<ReturnType<TLoaderFn>> extends Response | infer D
	? D
	: never;
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
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
    {/* Sidebar component, swap this element with another sidebar if you like *//*}
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
const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [{
      path: '/node/:nodeID',
      element: <Node />
    }]
  },
]);
document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed");
    ReactDOM.createRoot(document.getElementById("app")!).render(
        <div>
            <RouterProvider router={router} />
        </div>
    );
  });
