use crate::tables::user::*;
use spacetimedb::{ReducerContext, Table, reducer};

/// Register a new user to the database.
///
/// # Errors
/// - Return a String error if the user has already been registered.
#[reducer]
pub fn register_user(ctx: &ReducerContext, username: String, email: String) -> Result<(), String> {
    let caller = ctx.sender();

    match ctx.db.user().identity().find(caller) {
        Some(user) => {
            if user.require_registration() {
                let registered_user = user.register(username, email, ctx.timestamp);
                ctx.db.user().identity().update(registered_user);
                Ok(())
            } else {
                Err("The user has already been registered!".to_string())
            }
        }
        None => {
            let new_user =
                User::new(caller, ctx.timestamp).register(username, email, ctx.timestamp);
            ctx.db.user().insert(new_user);
            Ok(())
        }
    }
}

/// Change user information.
///
/// # Errors
/// - Return a String error if the caller does not exist in the User database.
#[reducer]
pub fn change_user_info(
    ctx: &ReducerContext,
    username: Option<String>,
    email: Option<String>,
) -> Result<(), String> {
    let caller = ctx.sender();

    let user = ctx
        .db
        .user()
        .identity()
        .find(caller)
        .ok_or("User does not exist in the database!")?;

    let updated_user = user.change_info(username, email, ctx.timestamp);

    ctx.db.user().identity().update(updated_user);
    Ok(())
}
