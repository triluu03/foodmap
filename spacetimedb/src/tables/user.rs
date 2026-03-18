use spacetimedb::{Identity, Timestamp, ViewContext, table, view};

#[table(accessor = user)]
pub struct User {
    #[primary_key]
    pub identity: Identity,
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

/// Get the user info of the current sender.
#[view(accessor = user_info, public)]
fn user_info(ctx: &ViewContext) -> Option<User> {
    ctx.db.user().identity().find(ctx.sender())
}
