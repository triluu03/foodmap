import { useTable, useSpacetimeDB } from "spacetimedb/react";
import { tables } from "../module_bindings/index.ts";

import Registration from "./Registration.tsx";
import FoodMap from "./FoodMap.tsx";

function MainPage() {
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
    return <FoodMap />;
  } else {
    return <Registration />;
  }
}

export default MainPage;
