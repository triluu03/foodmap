//! Friendship table.

use spacetimedb::{table, Identity, SpacetimeType, Timestamp};

#[derive(SpacetimeType, Debug, Clone, Copy, PartialEq)]
pub enum FriendRequestStatus {
    Accepted,
    Pending,
    Declined,
}

#[table(accessor=friend_request)]
pub struct FriendRequest {
    #[primary_key]
    #[auto_inc]
    pub id: u64,
    #[index(btree)]
    // NOTE: btree structure is optimized for reading and querying, especially when it involves
    // filtering and sorting, but it slows down the writing part.
    pub sender_id: Identity,
    #[index(btree)]
    pub receiver_id: Identity,
    pub status: FriendRequestStatus,
    created_at: Timestamp,
}

impl FriendRequest {
    /// Create a new friend request.
    pub fn new(sender_id: Identity, receiver_id: Identity, now: Timestamp) -> Self {
        FriendRequest {
            id: 0, // Auto-increment
            sender_id,
            receiver_id,
            status: FriendRequestStatus::Pending,
            created_at: now,
        }
    }

    /// Accept a friend request.
    pub fn accept(mut self) -> Self {
        self.status = FriendRequestStatus::Accepted;
        self
    }

    /// Decline a friend request.
    pub fn decline(mut self) -> Self {
        self.status = FriendRequestStatus::Declined;
        self
    }
}

#[table(accessor=friendship)]
pub struct FriendShip {
    #[primary_key]
    #[auto_inc]
    pub id: u64,
    #[index(btree)]
    pub user_a_id: Identity,
    #[index(btree)]
    pub user_b_id: Identity,
    created_at: Timestamp,
}

impl FriendShip {
    /// Create a new friendship.
    pub fn new(user_a_id: Identity, user_b_id: Identity, now: Timestamp) -> Self {
        FriendShip {
            id: 0,
            user_a_id,
            user_b_id,
            created_at: now,
        }
    }
}
