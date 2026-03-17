import { useMemo } from "react";
import "./App.css";
import MainPage from "./MainPage.tsx";

import { Identity } from "spacetimedb";
import { SpacetimeDBProvider } from "spacetimedb/react";
import { DbConnection, type ErrorContext } from "./module_bindings/index.ts";
import { useIdToken } from "./AutoLogin.tsx";

const DB_HOST = import.meta.env.VITE_SPACETIMEDB_HOST ?? "ws://localhost:3000";
const DB_NAME = import.meta.env.VITE_SPACETIMEDB_DB_NAME ?? "foodmap-db";
const DB_TOKEN_KEY = `${DB_HOST}/${DB_NAME}/auth_token`;

const onConnect = (_conn: DbConnection, identity: Identity) => {
  // localStorage.setItem(DB_TOKEN_KEY, token);
  // console.log(
  //   "Connected to SpacetimeDB with identity:",
  //   identity.toHexString(),
  // );
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
    <SpacetimeDBProvider connectionBuilder={connectionBuilder}>
      <MainPage />
    </SpacetimeDBProvider>
  );
}

export default App;
