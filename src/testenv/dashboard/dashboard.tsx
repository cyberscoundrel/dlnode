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
