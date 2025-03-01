pub type Spiral = [f32; 8];
// 8 levels of spiral dynamics
pub type Emotion = [f32; 21];  // 21 emotional states

#[derive(Debug, Clone)]
pub struct User {
    pub id: String,
    pub email: String,
    pub name: String,
    pub telegram: String,
    pub instegram: String,
    pub x_account: String,
    pub current_emotion_hybrid: f32,
    pub current_spiral_hybrid: f32,
    pub current_emotion: Emotion,
    pub current_spiral: Spiral,
    pub emotion_history: Vec<Emotion>,
    pub spiral_history: Vec<Spiral>,
}

impl User {
    pub fn new(
        id: String,
        email: String,
        name: String,
        telegram: String,
        instegram: String,
        x_account: String,
        current_emotion: Emotion,
        current_spiral: Spiral,
    ) -> Self {
        User {
            id,
            email,
            name,
            telegram,
            instegram,
            x_account,
            current_emotion_hybrid: Self::calculate_hybrid(&current_emotion),
            current_spiral_hybrid: Self::calculate_hybrid(&current_spiral),

            current_emotion,
            current_spiral,
            emotion_history: Vec::new(),
            spiral_history: Vec::new(),
        }
    }

    fn calculate_hybrid(values: &[f32]) -> f32 {
        let weighted_sum: f32 = values
            .iter()
            .enumerate()
            .map(|(i, &val)| (i as f32) * val)
            .sum();

        let total: f32 = values.iter().sum();

        if total == 0.0 {
            0.0
        } else {
            weighted_sum / total
        }
    }

    pub fn update_emotion(&mut self, new_emotion: Emotion) {
        self.emotion_history.push(self.current_emotion);
        self.current_emotion = new_emotion;
        self.current_emotion_hybrid = Self::calculate_hybrid(&self.current_emotion);
    }

    pub fn update_spiral(&mut self, new_spiral: Spiral) {
        self.spiral_history.push(self.current_spiral);
        self.current_spiral = new_spiral;
        self.current_spiral_hybrid = Self::calculate_hybrid(&self.current_spiral);
    }
}
