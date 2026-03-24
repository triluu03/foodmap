//! Food-rating table.

use spacetimedb::{table, Identity, SpacetimeType, Timestamp};

#[derive(SpacetimeType, Debug, Clone, Copy)]
pub enum Rating {
    One,
    Two,
    Three,
    Four,
    Five,
}

#[table(accessor = food_rating, public)]
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
