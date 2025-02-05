import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AppRouting from "./AppRouting.tsx";
import { Auth0Provider } from "@auth0/auth0-react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: 'http://localhost:5173/app',
        audience: "uhdacm",
        scope: "openid profile email"
      }}
    >
      <AppRouting />
    </Auth0Provider>
  </StrictMode>
);

console.log('initial stuffs', import.meta.env.VITE_AUTH0_DOMAIN, import.meta.env.VITE_AUTH0_CLIENT_ID, window.location.origin+'/app')