import * as React from 'react'
import {
    Outlet,
    Link,
    useLoaderData,
    LoaderFunctionArgs,
  } from "react-router-dom";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  TransitionChild,
} from '@headlessui/react'
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
  ArrowUpCircleIcon
} from '@heroicons/react/24/outline'
import { ChevronDownIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid'
import { DLMonitorLayerClient } from '../../../monitorlayerclient';
import axios from 'axios';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
  }

export type NavType = {
  name: string
  href: string
  icon: typeof HomeIcon
  current: boolean
}
 type InputPropType = {
  onField: (e: any) => void
  onAdd: () => void
  field: string
 }
  export const Input = (props: InputPropType) => {
    return (
      <div className='flex flex-row -mx-2'>
        <div className="mt-2 flex rounded-md shadow-sm mr-2">
          <span className="bg-slate-50 inline-flex items-center rounded-l-md border border-r-0 border-gray-300 px-2 text-gray-500 sm:text-sm">
            ws://
          </span>
          <input
          onChange={props.onField}
            id="company-website"
            name="company-website"
            type="text"
            placeholder="localhost:1234"
            value={props.field}
            className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border-0 pl-2 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 sm:text-sm sm:leading-16"
          />
        </div>
          <button onClick={props.onAdd} className='mt-2 px-2 text-gray-500 sm:text-sm rounded-md bg-slate-200'>Add</button>
      </div>
    )

  }
  
  type SideBarPropType = {
    elements: NavType[]
  }
  export const Sidebar = (props: SideBarPropType & InputPropType) => {
    return (<div className="lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
    {/* Sidebar component, swap this element with another sidebar if you like */}
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-900 px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <a href='/'>
          <HomeIcon className="h-6 w-6 text-white"></HomeIcon>
        </a>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <Input onAdd={props.onAdd} field={props.field} onField={props.onField}/>
          </li>
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {props.elements.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
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
                  </Link>
                </li>
              ))}
            </ul>
          </li>

          <li className="mt-auto">
            <s><a
              href="#"
              className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-indigo-200 hover:bg-indigo-700 hover:text-white"
            >
              <Cog6ToothIcon
                aria-hidden="true"
                className="h-6 w-6 shrink-0 text-indigo-200 group-hover:text-white"
              />
              Settings
            </a></s>
          </li>
        </ul>
      </nav>
    </div>
  </div>)
}



export const Root = () => {
  const [nodes, setNodes] = React.useState<DLMonitorLayerClient[]>([])
  const [elements, setElements] = React.useState<NavType[]>([])
  let [field, setField] = React.useState<string>('')
  React.useEffect(() => {
    let elms: NavType[] = []
    nodes.forEach((e, i) => {
      elms.push({
        name: e.url,
        href: `/node/${i}`,
        icon: ArrowUpCircleIcon,
        current: false
      })
    })
    setElements(elms)
  }, [nodes])
  React.useEffect(() => {
    console.log('get all node urls')
    axios.get('/instances').then((res) => {
      console.log(res.data)
      
      
      let newNodes = (res.data as string[]).map((e, i) => {
        return new DLMonitorLayerClient(e)
      })
      console.log(newNodes.length)
      console.log(newNodes.map(e => e.socket.readyState))
      console.log(newNodes.map(e => e.url))

      setNodes([...nodes, ...newNodes])

      console.log(nodes.length)
      console.log(nodes.map(e => e.socket.url))
      console.log(nodes)
    }).catch((err) => {
        console.log('no stat message')
    })
  }, [])


  const handleAdd = () => {
    let dlm = new DLMonitorLayerClient(`ws://${field}`)
    setNodes([...nodes, dlm])
  }
  const handleField = (event: React.ChangeEvent<HTMLInputElement>) => {
    setField(event.target.value)
  }
    
    return (<div>
        <Sidebar elements={elements} field={field} onAdd={handleAdd} onField={handleField}></Sidebar>
        <div className='ml-72 p-8'>
          <Outlet context={[nodes, setElements]}/>
        </div>
    </div>)
}