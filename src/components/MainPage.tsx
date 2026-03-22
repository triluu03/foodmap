import { useSpacetimeDB } from "spacetimedb/react";

import FoodMap from "./FoodMap.tsx";

function MainPage() {
  const { identity, isActive: connected } = useSpacetimeDB();
  console.log("Identity:", identity);
  console.log("Connected:", connected);

  if (!connected) {
    return <div>Loading...</div>;
  }

  return <FoodMap />;
}

export default MainPage;
