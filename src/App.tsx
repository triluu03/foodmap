import { useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainPage from "./components/MainPage.tsx";
import UserInfo from "./components/UserInfo.tsx";
import Layout from "./components/layout/Layout";

import { Identity } from "spacetimedb";
import { SpacetimeDBProvider } from "spacetimedb/react";
import { DbConnection, type ErrorContext } from "./module_bindings/index.ts";
import { useIdToken } from "./AutoLogin.tsx";

const DB_HOST = import.meta.env.VITE_SPACETIMEDB_HOST ?? "ws://localhost:3000";
const DB_NAME = import.meta.env.VITE_SPACETIMEDB_DB_NAME ?? "foodmap-db";

const onConnect = (_conn: DbConnection, identity: Identity) => {
  console.log(
    "Connected to SpacetimeDB with identity:",
    identity.toHexString(),
  );
};

const onDisconnect = () => {
  console.log("Disconnected from SpacetimeDB");
};

const onConnectError = (_ctx: ErrorContext, err: Error) => {
  console.log("Error connecting to SpacetimeDB:", err);
};

function App() {
  const idToken = useIdToken();

  const connectionBuilder = useMemo(() => {
    return DbConnection.builder()
      .withUri(DB_HOST)
      .withDatabaseName(DB_NAME)
      .withToken(idToken)
      .onConnect(onConnect)
      .onDisconnect(onDisconnect)
      .onConnectError(onConnectError);
  }, [idToken]);

  return (
    <BrowserRouter>
      <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<MainPage />} />
            <Route path="/user/:id" element={<UserInfo />} />
          </Route>
        </Routes>
      </SpacetimeDBProvider>
    </BrowserRouter>
  );
}

export default App;
