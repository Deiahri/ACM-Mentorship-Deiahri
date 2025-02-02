import { createBrowserRouter, RouterProvider } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import IntroOverlay from "./components/IntroOverlay/IntroOverlay";
import { Provider } from "react-redux";
import { store } from "./store";
import Dialog from "./features/Dialog/Dialog";
import App from "./components/App";

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage/>
  },
  {
    path: '/app',
    element: <App/>
  },
]);

export default function ApRouting() {
  return <>
    <Provider store={store}>
      <Dialog/>
      <IntroOverlay/>
      <RouterProvider router={router}/>
    </Provider>
  </>
}