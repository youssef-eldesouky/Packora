import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {createBrowserRouter,RouterProvider,} from "react-router";
import { AllData } from './Data/AllData';
import ScrollToTop from "react-scroll-to-top";
import SignUp from './components/SignUp/SignUp';
import ForgetPassword from './components/ForgetPass/ForgetPassword';
import EmailCheck from './components/ForgetPass/EmailCheck';
import HomePage from './components/Homepage/HomePage';
import Catalog from './components/Catalog/Catalog';

let router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "HomePage",
    element: <HomePage />,
  },
  {
    path: "SignUp",
    element: <SignUp />,
  },
  {
    path: "ForgetPassword",
    element: <ForgetPassword />,
  },
  {
    path: "EmailCheck",
    element: <EmailCheck />,
  },
  {
    path: "Catalog",
    element: <Catalog />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <AllData>
  <ScrollToTop smooth/>
      <RouterProvider router={router} />
  </AllData>

);
