//! Food-rating table.

use spacetimedb::{table, view, Identity, SpacetimeType, Timestamp, ViewContext};

use crate::tables::friendship::friend_list;

#[derive(SpacetimeType, Debug, Clone, Copy)]
pub enum Rating {
    One,
    Two,
    Three,
    Four,
    Five,
}

#[table(accessor = food_rating)]
pub struct FoodRating {
    #[primary_key]
    #[auto_inc]
    pub id: u64,
    #[index(btree)]
    user_id: Identity,
    pub longitude: f64,
    pub latitude: f64,
    pub rating: Rating,
    created_at: Timestamp,
}

impl FoodRating {
    /// Create a new rating.
    pub fn new(
        user_id: Identity,
        longitude: f64,
        latitude: f64,
        rating: Rating,
        now: Timestamp,
    ) -> Self {
        FoodRating {
            id: 0,
            user_id,
            longitude,
            latitude,
            rating,
            created_at: now,
        }
    }

    /// Modify an existing rating.
    pub fn modify(mut self, new_rating: Rating) -> Self {
        self.rating = new_rating;
        self
    }
}

#[view(accessor = all_ratings, public)]
pub fn all_ratings(ctx: &ViewContext) -> Vec<FoodRating> {
    let sender = ctx.sender();

    ctx.db.food_rating().user_id().filter(sender).collect()
}

#[view(accessor = all_friend_ratings, public)]
pub fn all_friend_ratings(ctx: &ViewContext) -> Vec<FoodRating> {
    let all_friends = friend_list(ctx);
    all_friends
        .iter()
        .flat_map(|user| ctx.db.food_rating().user_id().filter(user.identity))
        .collect()
}
