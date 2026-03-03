import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {createBrowserRouter,RouterProvider,} from "react-router";
import { AllData } from './Data/AllData';
import { CartProvider } from './context/CartContext';
import ScrollToTop from "react-scroll-to-top";
import SignUp from './components/SignUp/SignUp';
import ForgetPassword from './components/ForgetPass/ForgetPassword';
import EmailCheck from './components/ForgetPass/EmailCheck';
import HomePage from './components/Homepage/HomePage';
import Catalog from './components/Catalog/Catalog';
import Singlecard from './components/Singlecard/Singlecard';
import Track from './components/Track/Track';
import Cart from './components/Cart/Cart';
import Checkout from './components/Cart/Checkout';
import Support from './components/Support/Support';

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
  {
    path: "Catalog/:productId",
    element: <Singlecard />,
  },
  {
    path: "Track",
    element: <Track />,
  },
  {
    path: "Cart",
    element: <Cart />,
  },
  {
    path: "Cart/checkout",
    element: <Checkout />,
  },
  {
    path: "Support",
    element: <Support />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <AllData>
    <CartProvider>
      <ScrollToTop smooth/>
      <RouterProvider router={router} />
    </CartProvider>
  </AllData>

);
