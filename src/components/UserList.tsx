import { Link } from "react-router-dom";
import { useTable, useSpacetimeDB } from "spacetimedb/react";
import { tables } from "../module_bindings";

function UserList() {
  const { identity, isActive: connected } = useSpacetimeDB();

  if (!connected || identity === undefined) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Connecting to database...</p>
      </div>
    );
  }

  const [allUsers] = useTable(
    tables.user.where((r) => r.registered.eq(true) && r.identity.ne(identity)),
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User List</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <ul className="space-y-2">
          {allUsers?.map((user) => (
            <li key={user.identity.toHexString()}>
              <Link
                to={`/user/${user.identity.toHexString()}`}
                className="text-orange-600 hover:text-orange-700 hover:underline"
              >
                {user.username ?? "Unnamed"}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default UserList;
