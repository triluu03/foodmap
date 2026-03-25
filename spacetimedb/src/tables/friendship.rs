//! Friendship table.

use spacetimedb::{table, view, Identity, SpacetimeType, Timestamp, ViewContext};

use crate::tables::user::*;

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

#[view(accessor = friend_list, public)]
pub fn friend_list(ctx: &ViewContext) -> Vec<User> {
    let sender = ctx.sender();

    let mut friendship_a_list: Vec<User> = ctx
        .db
        .friendship()
        .user_a_id()
        .filter(sender)
        // TODO: address the unwrap below
        .map(|r| ctx.db.user().identity().find(r.user_b_id).unwrap())
        .collect();

    let friendship_b_list: Vec<User> = ctx
        .db
        .friendship()
        .user_b_id()
        .filter(sender)
        // TODO: address the unwrap below
        .map(|r| ctx.db.user().identity().find(r.user_a_id).unwrap())
        .collect();

    friendship_a_list.extend(friendship_b_list);
    friendship_a_list
}

#[view(accessor = all_pending_sent_requests, public)]
pub fn have_pending_sent_request(ctx: &ViewContext) -> Vec<FriendRequest> {
    let sender = ctx.sender();
    ctx.db
        .friend_request()
        .sender_id()
        .filter(sender)
        .filter(|row| row.status == FriendRequestStatus::Pending)
        .collect()
}

#[view(accessor = all_pending_received_requests, public)]
pub fn have_pending_received_request(ctx: &ViewContext) -> Vec<FriendRequest> {
    let sender = ctx.sender();
    ctx.db
        .friend_request()
        .receiver_id()
        .filter(sender)
        .filter(|row| row.status == FriendRequestStatus::Pending)
        .collect()
}
