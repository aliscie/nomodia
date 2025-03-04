mod user;

pub use user::*;

use std::cell::RefCell;
use ic_cdk_macros;
use candid::{CandidType, Deserialize};
use ic_cdk_macros::{init, post_upgrade, pre_upgrade, query, update};
use ic_stable_memory::{
    derive::{CandidAsDynSizeBytes, StableType},
    retrieve_custom_data, stable_memory_init, stable_memory_post_upgrade,
    stable_memory_pre_upgrade, store_custom_data, SBox,
};

#[derive(CandidType, Deserialize, StableType, CandidAsDynSizeBytes, Debug, Clone)]
struct State {
    counter: u32,
}

impl Default for State {
    fn default() -> Self {
        State { counter: 0 }
    }
}

thread_local! {
    static STATE: RefCell<Option<State>> = RefCell::default();
}

#[init]
fn init() {
    stable_memory_init();

    STATE.with(|s| {
        *s.borrow_mut() = Some(State::default());
    });
}

#[pre_upgrade]
fn pre_upgrade() {
    let state = STATE.with(|s| s.borrow_mut().take().unwrap());
    let boxed_state = SBox::new(state).expect("Out of memory");

    store_custom_data::<State>(0, boxed_state);
    stable_memory_pre_upgrade().expect("Out of memory");
}

#[post_upgrade]
fn post_upgrade() {
    stable_memory_post_upgrade();

    let state = retrieve_custom_data::<State>(0).unwrap().into_inner();
    STATE.with(|s| {
        *s.borrow_mut() = Some(state);
    });
}

#[query]
fn get() -> u32 {
    STATE.with(|s| s.borrow().as_ref().unwrap().counter)
}

#[update]
fn inc() {
    STATE.with(|s| s.borrow_mut().as_mut().unwrap().counter += 1)
}

#[update]
fn set(value: u32) {
    STATE.with(|s| s.borrow_mut().as_mut().unwrap().counter = value)
}


#[query]
fn helo_world() -> String {
    return "Hello World".to_string();
}


#[cfg(test)]
mod tests {
    // use crate::friends::Friend;
    // use crate::user::User;
    use crate::{Emotion, Spiral, User};

    #[test]
    fn test_one() {
        let initial_emotion: Emotion = [0.05; 21];  // Neutral emotional state
        let initial_spiral: Spiral = [0.12, 0.18, 0.25, 0.15, 0.10, 0.08, 0.07, 0.05];

        let mut user = User::new(
            "user_123".to_string(),
            "user@nomodia.com".to_string(),
            "Nomodiac".to_string(),
            "@nomodiac".to_string(),
            "@nomodiac".to_string(),
            "@nomodiac".to_string(),
            initial_emotion,
            initial_spiral,
        );

        println!("Initial hybrid scores:");
        println!("Emotion: {:.2}", user.current_emotion_hybrid);
        println!("Spiral: {:.2}", user.current_spiral_hybrid);

        // Update emotional state
        let new_emotion: Emotion = [0.08; 21];
        user.update_emotion(new_emotion);

        println!("\nAfter emotional update:");
        println!("Emotion: {:.2}", user.current_emotion_hybrid);
        println!("History entries: {}", user.emotion_history.len());
    }
}

fn backend_wasm() -> Vec<u8> {
    let wasm_path = std::env::var_os("backend_WASM").expect("Missing counter wasm file");
    std::fs::read(wasm_path).unwrap()
}

// ic_cdk_macros::export_candid!();
