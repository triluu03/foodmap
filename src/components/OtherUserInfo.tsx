import { useParams } from "react-router-dom";
import { useTable, useReducer } from "spacetimedb/react";
import { tables, reducers } from "../module_bindings";
import { Identity, RefBuilder } from "spacetimedb";

function OtherUserInfo() {
  const { id } = useParams<{ id: string }>();
  const targetUserIdentity = id ? Identity.fromString(id) : undefined;

  if (id === undefined || targetUserIdentity === undefined) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">User Information</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">User profile details unavailable!</p>
        </div>
      </div>
    );
  }

  const [users] = useTable(tables.user.where((r) => r.registered.eq(true)));
  const targetUser = users.filter((user) =>
    user.identity.equals(targetUserIdentity),
  )[0];

  const [friendList] = useTable(tables.friend_list);
  const isFriend =
    friendList.filter((user) => user.identity.equals(targetUserIdentity))
      .length > 0;

  const [allPendingSentRequests] = useTable(tables.all_pending_sent_requests);
  const sentRequests = allPendingSentRequests.filter((request) =>
    request.receiverId.equals(targetUserIdentity),
  );

  const [allPendingReceivedRequests] = useTable(
    tables.all_pending_received_requests,
  );
  const receivedRequests = allPendingReceivedRequests.filter((request) =>
    request.senderId.equals(targetUserIdentity),
  );

  const sendFriendRequest = useReducer(reducers.sendFriendRequest);
  const acceptFriendRequest = useReducer(reducers.acceptFriendRequest);
  const declineFriendRequest = useReducer(reducers.declineFriendRequest);
  const cancelFriendRequest = useReducer(reducers.cancelFriendRequest);
  const removeFriend = useReducer(reducers.removeFriend);

  const handleSendFriendRequest = async () => {
    try {
      await sendFriendRequest({ receiverId: targetUserIdentity });
    } catch (err) {
      console.error("Failed to send friend request:", err);
    }
  };

  const handleAcceptFriendRequest = async () => {
    if (receivedRequests.length > 0) {
      const requestToAccept = receivedRequests[0];
      try {
        await acceptFriendRequest({ friendRequestId: requestToAccept.id });
      } catch (err) {
        console.error("Failed to accept friend request:", err);
      }
    }
  };

  const handleDeclineFriendRequest = async () => {
    if (receivedRequests.length > 0) {
      const requestToDecline = receivedRequests[0];
      try {
        await declineFriendRequest({ friendRequestId: requestToDecline.id });
      } catch (err) {
        console.error("Failed to decline friend request:", err);
      }
    }
  };

  const handleCancelFriendRequest = async () => {
    if (sentRequests.length > 0) {
      const requestToCancel = sentRequests[0];
      try {
        await cancelFriendRequest({ friendRequestId: requestToCancel.id });
      } catch (err) {
        console.error("Failed to cancel friend request:", err);
      }
    }
  };

  const handleRemoveFriend = async () => {
    try {
      await removeFriend({ friendUserId: targetUserIdentity });
    } catch (err) {
      console.error("Failed to remove friend:", err);
    }
  };

  if (!targetUser) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">User Information</h1>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-500">User not found!</p>
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
            <p className="text-lg">{targetUser?.username || "Not set"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-lg">{targetUser?.email || "Not set"}</p>
          </div>
          {isFriend ? (
            <button
              onClick={handleRemoveFriend}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Remove Friend
            </button>
          ) : sentRequests.length > 0 ? (
            <button
              onClick={handleCancelFriendRequest}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel Friend Request
            </button>
          ) : receivedRequests.length > 0 ? (
            <div>
              <button
                onClick={handleAcceptFriendRequest}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Accept Friend Request
              </button>
              <button
                onClick={handleDeclineFriendRequest}
                className="ml-2 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Decline Friend Request
              </button>
            </div>
          ) : (
            <button
              onClick={handleSendFriendRequest}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Send Friend Request
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OtherUserInfo;
