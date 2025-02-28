import React, { useState, useRef } from 'react';
import { Box, Container, Typography, Card, Button, Stack } from '@mui/material';
import { motion, PanInfo, useAnimation } from 'framer-motion';

const QuizPage = () => {
  const spiralDiagnosisQuestions = [
    "Do your daily actions mainly revolve around fulfilling basic survival needs (food, safety, shelter)?", // Beige
    "Do you rely on traditions, rituals, or group loyalty to maintain safety and belonging?", // Purple
    "Do you prioritize personal power and resist being controlled by others, even if it leads to conflict?", // Red
    "Do you find purpose in adhering to a clear set of rules, traditions, or moral codes?", // Blue
    "Are achieving success, innovation, and efficiency your primary motivators?", // Orange
    "Do you prioritize community well-being, equality, and environmental sustainability over personal gain?", // Green
    "Do you focus on understanding systems and adapting flexibly to complex challenges?", // Yellow
    "Do you feel a holistic connection to all life and seek integrative solutions for global issues?", // Turquoise
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      // Swiped right - Yes
      handleAnswer(true);
      controls.start({ x: '100vw', opacity: 0, transition: { duration: 0.3 } });
    } else if (info.offset.x < -threshold) {
      // Swiped left - No
      handleAnswer(false);
      controls.start({ x: '-100vw', opacity: 0, transition: { duration: 0.3 } });
    } else {
      // Reset position if not swiped far enough
      controls.start({ x: 0, opacity: 1, transition: { duration: 0.3 } });
    }
  };

  const handleAnswer = (answer: boolean) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    
    setTimeout(() => {
      if (currentQuestionIndex < spiralDiagnosisQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        controls.start({ x: 0, opacity: 1 });
      } else {
        setQuizCompleted(true);
      }
    }, 300);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setQuizCompleted(false);
    controls.start({ x: 0, opacity: 1 });
  };

  const getColorForIndex = (index: number) => {
    const colors = ['#F5F5DC', '#800080', '#FF0000', '#0000FF', '#FFA500', '#008000', '#FFFF00', '#40E0D0'];
    return colors[index % colors.length];
  };

  return (
    <Container>
      <Box sx={{ p: 2, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Spiral Dynamics Quiz
        </Typography>
        
        {!quizCompleted ? (
          <>
            <Box sx={{ position: 'relative', width: '100%', height: 300, my: 4 }}>
              <motion.div
                ref={cardRef}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                animate={controls}
                initial={{ x: 0, opacity: 1 }}
                style={{ width: '100%', position: 'absolute' }}
              >
                <Card 
                  sx={{ 
                    p: 4, 
                    borderRadius: 2, 
                    boxShadow: 3,
                    height: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    borderLeft: `8px solid ${getColorForIndex(currentQuestionIndex)}`,
                    backgroundColor: `${getColorForIndex(currentQuestionIndex)}22`
                  }}
                >
                  <Typography variant="h6" align="center">
                    {spiralDiagnosisQuestions[currentQuestionIndex]}
                  </Typography>
                </Card>
              </motion.div>
            </Box>
            
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                variant="outlined" 
                color="error"
                onClick={() => handleAnswer(false)}
              >
                No (Swipe Left)
              </Button>
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                Question {currentQuestionIndex + 1} of {spiralDiagnosisQuestions.length}
              </Typography>
              <Button 
                variant="outlined" 
                color="success"
                onClick={() => handleAnswer(true)}
              >
                Yes (Swipe Right)
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ width: '100%', mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Quiz Results
            </Typography>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="body1" paragraph>
                Your answers:
              </Typography>
              <Stack spacing={1}>
                {spiralDiagnosisQuestions.map((question, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: `${getColorForIndex(index)}22`,
                      borderLeft: `4px solid ${getColorForIndex(index)}`
                    }}
                  >
                    <Typography variant="body2" gutterBottom>
                      {question}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {answers[index] ? "Yes" : "No"}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button variant="contained" onClick={resetQuiz}>
                  Take Quiz Again
                </Button>
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default QuizPage;