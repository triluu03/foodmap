import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AutoLogin } from "./AutoLogin.tsx";
import { Auth0Provider } from "@auth0/auth0-react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Auth0Provider
      domain="triluu.eu.auth0.com"
      clientId="eDaNnHGs4kwYZjB1fCGQVeHmer4BRVLg"
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <AutoLogin>
        <App />
      </AutoLogin>
    </Auth0Provider>
  </StrictMode>,
);
