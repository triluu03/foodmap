use crate::tables::user::*;
use spacetimedb::{ReducerContext, Table, reducer};

#[reducer(init)]
pub fn init(_ctx: &ReducerContext) {
    // Called when the module is initially published
}

#[reducer(client_connected)]
pub fn identity_connected(ctx: &ReducerContext) {
    // Called everytime a new client connects
    let caller = ctx.sender();

    match ctx.db.user().identity().find(caller) {
        Some(_) => log::info!("Found user in the database!"),
        None => {
            log::info!(
                "Could not find any user with identity {}. Creating a default user!",
                caller
            );
            let new_user = User::new(caller, ctx.timestamp);
            ctx.db.user().insert(new_user);
        }
    }
}

#[reducer(client_disconnected)]
pub fn identity_disconnected(_ctx: &ReducerContext) {
    // Called everytime a client disconnects
}
