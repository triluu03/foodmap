use spacetimedb::{reducer, table, view, Identity, ReducerContext, Table, Timestamp, ViewContext};

#[table(accessor = user)]
pub struct User {
    #[primary_key]
    identity: Identity,
    username: String,
    email: String,
    registered: bool,
    created_at: Timestamp,
    modified_at: Timestamp,
}

impl User {
    /// Create a new User based on the Identity and the Timestamp.
    pub fn new(identity: Identity, now: Timestamp) -> Self {
        User {
            identity,
            username: String::new(),
            email: String::new(),
            registered: false,
            created_at: now,
            modified_at: now,
        }
    }

    /// Register an user with username and email.
    pub fn register(self, username: String, email: String, now: Timestamp) -> Self {
        let username = username.trim().to_string();
        let email = email.trim().to_string();
        User {
            username,
            email,
            registered: true,
            modified_at: now,
            ..self
        }
    }

    /// Change user information
    pub fn change_info(
        self,
        username: Option<String>,
        email: Option<String>,
        now: Timestamp,
    ) -> Self {
        let username = username.unwrap_or(self.username);
        let email = email.unwrap_or(self.email);
        User {
            username,
            email,
            modified_at: now,
            ..self
        }
    }

    /// Check whether the user needs registration
    pub fn require_registration(&self) -> bool {
        !self.registered
    }
}

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

/// Get the user info of the current sender.
#[view(accessor = user_info, public)]
fn user_info(ctx: &ViewContext) -> Option<User> {
    ctx.db.user().identity().find(ctx.sender())
}
