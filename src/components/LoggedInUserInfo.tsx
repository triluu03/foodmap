import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSpacetimeDB, useTable, useReducer } from "spacetimedb/react";
import { tables, reducers } from "../module_bindings";

import Registration from "./Registration";
import type { Identity } from "spacetimedb";

interface User {
  identity: Identity;
  username: String;
  email: String;
}
interface FriendListProps {
  friends: User[];
}

interface FriendRequest {
  senderId: Identity;
  senderUsername: String | undefined;
}
interface FriendRequestsProps {
  requests: FriendRequest[];
}

function FriendList({ friends }: FriendListProps) {
  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold mb-4">Friends</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <ul className="space-y-2">
          {friends.map((user) => (
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

function FriendRequests({ requests }: FriendRequestsProps) {
  return (
    <div className="mt-6">
      <h1 className="text-2xl font-bold mb-4">Friend Requests</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <ul className="space-y-2">
          {requests.map((request) => (
            <li key={request.senderId.toHexString()}>
              <Link
                to={`/user/${request.senderId.toHexString()}`}
                className="text-orange-600 hover:text-orange-700 hover:underline"
              >
                {request.senderUsername ?? "Unnamed"}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function LoggedInUserInfo() {
  const { isActive: connected } = useSpacetimeDB();

  const [users] = useTable(tables.user.where((r) => r.registered.eq(true)));
  const [info] = useTable(tables.user_info);
  const loggedInUserInfo = info[0];

  const [friendList] = useTable(tables.friend_list);
  const friends = friendList.map((user) => ({
    identity: user.identity,
    username: user.username,
    email: user.email,
  }));

  const [allPendingReceivedRequests] = useTable(
    tables.all_pending_received_requests,
  );
  const friendRequests = allPendingReceivedRequests.map((request) => ({
    senderId: request.senderId,
    senderUsername: users.find((user) => user.identity.equals(request.senderId))
      ?.username,
  }));

  const changeUserInfo = useReducer(reducers.changeUserInfo);

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (loggedInUserInfo) {
      setUsername(loggedInUserInfo.username || "");
      setEmail(loggedInUserInfo.email || "");
    }
  }, [loggedInUserInfo]);

  const handleSave = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await changeUserInfo({
        username: username || undefined,
        email: email || undefined,
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update user info:", err);
    }
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    if (loggedInUserInfo) {
      setUsername(loggedInUserInfo.username || "");
      setEmail(loggedInUserInfo.email || "");
    }
    setIsEditing(false);
  };

  if (!connected) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Connecting to database...</p>
      </div>
    );
  }

  if (!loggedInUserInfo) {
    return (
      <div className="p-8">
        <p className="text-gray-500">User information not found.</p>
      </div>
    );
  }

  if (!loggedInUserInfo.registered) {
    return <Registration />;
  }

  if (isEditing) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Edit User Information</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all disabled:bg-gray-100"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-orange-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">User Information</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Username</p>
            <p className="text-lg">{loggedInUserInfo.username || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-lg">{loggedInUserInfo.email || "Not set"}</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
      <FriendList friends={friends} />
      <FriendRequests requests={friendRequests} />
    </div>
  );
}

export default LoggedInUserInfo;
