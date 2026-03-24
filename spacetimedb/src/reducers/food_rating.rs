//! Reducers for food-rating.

use crate::tables::food_rating::*;
use spacetimedb::{ReducerContext, Table, reducer};

#[reducer]
pub fn add_new_rating(
    ctx: &ReducerContext,
    longitude: f64,
    latitude: f64,
    rating: Rating,
) -> Result<(), String> {
    let sender = ctx.sender();

    if ctx
        .db
        .food_rating()
        .iter()
        .filter(|row| row.longitude == longitude && row.latitude == latitude)
        .next()
        .is_some()
    {
        return Err("Sender already has a rating for the current location!".to_string());
    }

    let new_rating = FoodRating::new(sender, longitude, latitude, rating, ctx.timestamp);
    ctx.db.food_rating().try_insert(new_rating)?;

    Ok(())
}

#[reducer]
pub fn modify_a_rating(
    ctx: &ReducerContext,
    rating_id: u64,
    new_rating: Rating,
) -> Result<(), String> {
    let current_rating = ctx
        .db
        .food_rating()
        .id()
        .find(rating_id)
        .ok_or("Could not find the specified rating for current user!")?;

    let new_rating = current_rating.modify(new_rating);
    ctx.db.food_rating().id().update(new_rating);

    Ok(())
}
