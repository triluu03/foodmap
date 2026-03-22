import { useState } from "react";
import { useReducer, useTable, useSpacetimeDB } from "spacetimedb/react";
import { tables, reducers } from "./module_bindings";

import Registration from "./Registration";
import { useAuth0 } from "@auth0/auth0-react";

function MainPage() {
  const { logout } = useAuth0();

  const { identity, isActive: connected } = useSpacetimeDB();
  console.log("Identity:", identity);
  console.log("Connected:", connected);

  const [info] = useTable(tables.user_info);
  const currentUserInfo = info[0];

  console.log("User info: ", info[0]);

  if (!connected || currentUserInfo === undefined) {
    return <div>Loading...</div>;
  }

  if (currentUserInfo.registered) {
    return (
      <div>
        <h1>Welcome to Foodmap</h1>
        <button
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
        >
          Logout
        </button>
      </div>
    );
  } else {
    return <Registration />;
  }
}

export default MainPage;
