//! Friendship management reducers.

use crate::tables::{friendship::*, user::*};
use spacetimedb::{reducer, view, Identity, ReducerContext, Table, ViewContext};

fn ordered_pair(user_a_id: Identity, user_b_id: Identity) -> (Identity, Identity) {
    if user_a_id < user_b_id {
        (user_a_id, user_b_id)
    } else {
        (user_b_id, user_a_id)
    }
}

fn are_friends(ctx: &ReducerContext, friend_id: Identity) -> bool {
    let sender = ctx.sender();
    let (lower_user_id, higher_user_id) = ordered_pair(sender, friend_id);

    ctx.db
        .friendship()
        .user_a_id()
        .filter(lower_user_id)
        .filter(|row| row.user_b_id == higher_user_id)
        .next()
        .is_some()
}

fn have_pending_friend_request(ctx: &ReducerContext, receiver_id: Identity) -> bool {
    let sender = ctx.sender();

    ctx.db
        .friend_request()
        .iter()
        .filter(|row| {
            row.sender_id == sender
                && row.receiver_id == receiver_id
                && row.status == FriendRequestStatus::Pending
        })
        .next()
        .is_some()
}

#[reducer]
pub fn send_friend_request(ctx: &ReducerContext, receiver_id: Identity) -> Result<(), String> {
    let sender = ctx.sender();

    if are_friends(ctx, receiver_id) {
        return Err("The sender is already a friend to the receiver!".to_string());
    }
    if have_pending_friend_request(ctx, receiver_id) {
        return Err("There is a pending friend request already!".to_string());
    }

    let new_friend_request = FriendRequest::new(sender, receiver_id, ctx.timestamp);
    ctx.db.friend_request().try_insert(new_friend_request)?;
    Ok(())
}

#[reducer]
pub fn accept_friend_request(ctx: &ReducerContext, friend_request_id: u64) -> Result<(), String> {
    let accepted_friend_request = ctx
        .db
        .friend_request()
        .id()
        .find(friend_request_id)
        .ok_or("Cannot find the mentioned friend request in DB!")?
        .accept();

    let (lower_user_id, high_user_id) = ordered_pair(
        accepted_friend_request.sender_id,
        accepted_friend_request.receiver_id,
    );
    let new_friendship = FriendShip::new(lower_user_id, high_user_id, ctx.timestamp);

    ctx.db.friend_request().id().update(accepted_friend_request);
    ctx.db.friendship().try_insert(new_friendship)?;

    Ok(())
}

#[reducer]
pub fn decline_friend_request(ctx: &ReducerContext, friend_request_id: u64) -> Result<(), String> {
    let declined_friend_request = ctx
        .db
        .friend_request()
        .id()
        .find(friend_request_id)
        .ok_or("Cannot find the mentioned friend request in DB!")?
        .decline();
    ctx.db.friend_request().id().update(declined_friend_request);

    Ok(())
}

#[reducer]
pub fn cancel_friend_request(ctx: &ReducerContext, friend_request_id: u64) -> Result<(), String> {
    ctx.db.friend_request().id().delete(friend_request_id);
    Ok(())
}

#[reducer]
pub fn remove_friend(ctx: &ReducerContext, friend_user_id: Identity) -> Result<(), String> {
    let sender = ctx.sender();
    let (lower_user_id, higher_user_id) = ordered_pair(sender, friend_user_id);

    let friendship = ctx
        .db
        .friendship()
        .iter()
        .filter(|friendship| {
            friendship.user_a_id == lower_user_id && friendship.user_b_id == higher_user_id
        })
        .next()
        .ok_or("Cannot find the friendship in the DB!")?;

    ctx.db.friendship().id().delete(friendship.id);

    Ok(())
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
