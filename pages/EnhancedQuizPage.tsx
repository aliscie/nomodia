import React, { useState, useRef, useEffect } from 'react';
import { Box, Container, Typography, Card, Button, Stack, CircularProgress, LinearProgress } from '@mui/material';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEventsFromGemini } from '../src/utils/geminiAgent';

// Define the quiz types for internal tracking
type QuizType = 'spiralDynamics' | 'emotionalScale' | 'geminiGenerated';

// Define a structure to track question sources
type Question = {
  text: string;
  type: QuizType;
  originalIndex: number;
};

const EnhancedQuizPage = () => {
  // Spiral Dynamics questions from the existing QuizPage
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

  // Emotional Scale questions based on the 22-point scale from the whitepaper
  const emotionalScaleQuestions = [
    "Do you frequently experience feelings of fear, grief, depression, or despair?", // Level 1
    "Do you often feel guilty about your actions or decisions?", // Level 2
    "Do you struggle with feelings of insecurity in various aspects of your life?", // Level 3
    "Do you find yourself feeling jealous of others' achievements or relationships?", // Level 4
    "Do you experience intense feelings of hatred or rage toward certain people or situations?", // Level 5
    "Do you have thoughts of revenge when someone wrongs you?", // Level 6
    "Do you frequently feel angry about circumstances in your life?", // Level 7
    "Do you often feel discouraged about your future prospects?", // Level 8
    "Do you tend to blame others for problems in your life?", // Level 9
    "Do you worry excessively about potential future problems?", // Level 10
    "Do you frequently doubt your abilities or decisions?", // Level 11
    "Do you often feel disappointed with outcomes in your life?", // Level 12
    "Do you feel overwhelmed by responsibilities or expectations?", // Level 13
    "Do you experience frequent frustration, irritation, or impatience?", // Level 14
    "Do you tend to see the negative aspects of situations first?", // Level 15
    "Do you often feel bored or disengaged with daily activities?", // Level 16
    "Do you generally feel content with your current life situation?", // Level 17
    "Do you maintain hope even during challenging circumstances?", // Level 18
    "Do you typically maintain an optimistic outlook on life?", // Level 19
    "Do you frequently experience enthusiasm, eagerness, or happiness?", // Level 20
    "Do you feel passionate about your work, relationships, or interests?", // Level 21
    "Do you regularly experience joy, empowerment, freedom, love, or appreciation?", // Level 22
  ];

  // Fixed set of general questions for all users (replacing Gemini-generated questions)
  const fixedGeneralQuestions = [
    "Do you feel connected to a larger purpose in life?",
    "Do you often find yourself thinking about the future?",
    "Do you prioritize harmony in your relationships?",
    "Do you feel energized when solving complex problems?",
    "Do you often experience a sense of wonder about the world?",
    "Do you feel that your emotional state affects your daily decisions?",
    "Do you find it easy to adapt to new situations?",
    "Do you prefer structured environments with clear rules?",
    "Do you feel that your current life aligns with your values?",
    "Do you often feel a sense of gratitude for what you have?"
  ];

  // State variables
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [spiralAnswers, setSpiralAnswers] = useState<boolean[]>(Array(spiralDiagnosisQuestions.length).fill(false));
  const [emotionalAnswers, setEmotionalAnswers] = useState<boolean[]>(Array(emotionalScaleQuestions.length).fill(false));
  const [generalAnswers, setGeneralAnswers] = useState<boolean[]>(Array(fixedGeneralQuestions.length).fill(false));
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);
  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);

  // Function to shuffle an array using Fisher-Yates algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Initialize or reset the quiz with shuffled questions
  const initializeQuiz = () => {
    // Create question objects with their source type
    const spiralQs = spiralDiagnosisQuestions.map((q, i) => ({
      text: q,
      type: 'spiralDynamics' as QuizType,
      originalIndex: i
    }));
    
    const emotionalQs = emotionalScaleQuestions.map((q, i) => ({
      text: q,
      type: 'emotionalScale' as QuizType,
      originalIndex: i
    }));
    
    const generalQs = fixedGeneralQuestions.map((q, i) => ({
      text: q,
      type: 'geminiGenerated' as QuizType, // Keep the same type for compatibility
      originalIndex: i
    }));
    
    // Combine all questions
    const allQuestions = [...spiralQs, ...emotionalQs, ...generalQs];
    
    // Shuffle the combined questions
    const shuffled = shuffleArray(allQuestions);
    
    // Set the shuffled questions
    setShuffledQuestions(shuffled);
    
    // Reset answers
    setSpiralAnswers(Array(spiralDiagnosisQuestions.length).fill(false));
    setEmotionalAnswers(Array(emotionalScaleQuestions.length).fill(false));
    setGeneralAnswers(Array(fixedGeneralQuestions.length).fill(false));
    
    // Reset current question index
    setCurrentQuestionIndex(0);
    
    // Reset quiz completion status
    setQuizCompleted(false);
    
    // Reset animation
    controls.start({ x: 0, opacity: 1 });
  };

  // Calculate the emotional scale score (1-22)
  const calculateEmotionalScore = () => {
    // Count yes answers and their positions
    const yesAnswers = emotionalAnswers.reduce((acc, answer, index) => {
      if (answer) acc.push(index + 1); // +1 because emotional scale is 1-22
      return acc;
    }, [] as number[]);

    if (yesAnswers.length === 0) return 0;

    // Calculate average emotional level
    const sum = yesAnswers.reduce((acc, level) => acc + level, 0);
    return Math.round(sum / yesAnswers.length);
  };

  // Calculate spiral dynamics scores for each level
  const calculateSpiralScores = () => {
    const spiralLevels = ['Beige', 'Purple', 'Red', 'Blue', 'Orange', 'Green', 'Yellow', 'Turquoise'];
    const scores = spiralLevels.map((_, index) => {
      return spiralAnswers[index] ? 1 : 0;
    });
    return scores;
  };

  // Effect to initialize the quiz when component mounts
  useEffect(() => {
    // Check if there's saved progress in localStorage
    const savedProgress = localStorage.getItem('quizProgress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCurrentQuestionIndex(progress.currentQuestionIndex);
      setSpiralAnswers(progress.spiralAnswers);
      setEmotionalAnswers(progress.emotionalAnswers);
      setGeneralAnswers(progress.generalAnswers);
      setShuffledQuestions(progress.shuffledQuestions);
      setQuizCompleted(progress.quizCompleted);
    } else {
      initializeQuiz();
    }
  }, []);
  
  // Effect to save progress to localStorage whenever relevant state changes
  useEffect(() => {
    if (shuffledQuestions.length > 0) {
      const progress = {
        currentQuestionIndex,
        spiralAnswers,
        emotionalAnswers,
        generalAnswers,
        shuffledQuestions,
        quizCompleted
      };
      localStorage.setItem('quizProgress', JSON.stringify(progress));
    }
  }, [currentQuestionIndex, spiralAnswers, emotionalAnswers, generalAnswers, shuffledQuestions, quizCompleted]);
  
  // Effect to handle animation controls after component mount and state updates
  useEffect(() => {
    if (shuffledQuestions.length > 0 && !quizCompleted) {
      controls.start({ x: 0, opacity: 1 });
    }
  }, [controls, shuffledQuestions, currentQuestionIndex, quizCompleted]);

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
    if (currentQuestionIndex >= shuffledQuestions.length) return;
    
    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    
    // Store the answer in the appropriate array based on question type
    switch (currentQuestion.type) {
      case 'spiralDynamics':
        const newSpiralAnswers = [...spiralAnswers];
        newSpiralAnswers[currentQuestion.originalIndex] = answer;
        setSpiralAnswers(newSpiralAnswers);
        break;
      case 'emotionalScale':
        const newEmotionalAnswers = [...emotionalAnswers];
        newEmotionalAnswers[currentQuestion.originalIndex] = answer;
        setEmotionalAnswers(newEmotionalAnswers);
        break;
      case 'geminiGenerated':
        const newGeneralAnswers = [...generalAnswers];
        newGeneralAnswers[currentQuestion.originalIndex] = answer;
        setGeneralAnswers(newGeneralAnswers);
        break;
    }
    
    setTimeout(() => {
      if (currentQuestionIndex < shuffledQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        // Note: controls.start() is now handled in a useEffect hook
      } else {
        setQuizCompleted(true);
      }
    }, 300);
  };
  const [loading, setLoading] = useState(false);
  const resetQuiz = async () => {
    setLoading(true);
    // Clear saved progress from localStorage
    localStorage.removeItem('quizProgress');
    
    try {
      // Get new questions from Gemini
      const prompt = "Generate 10 introspective questions about personal growth, life goals, and emotional intelligence. Format each question to start with 'Do you' and be answerable with yes/no.";
      const events = await getEventsFromGemini(prompt);
      
      // Extract questions from events descriptions
      const newGeneralQuestions = events.slice(0, 10).map(event => 
        event.description.startsWith('Do you') ? event.description : `Do you ${event.description.toLowerCase()}`
      );
      
      // Update fixedGeneralQuestions with new ones
      fixedGeneralQuestions.splice(0, fixedGeneralQuestions.length, ...newGeneralQuestions);
    } catch (error) {
      console.error('Error generating new questions:', error);
      // If there's an error, we'll use the existing questions
    }
    setLoading(false);
    initializeQuiz();
  };

  const getColorForQuestion = (question: Question) => {
    // Colors for spiral dynamics
    if (question.type === 'spiralDynamics') {
      const colors = ['#F5F5DC', '#800080', '#FF0000', '#0000FF', '#FFA500', '#008000', '#FFFF00', '#40E0D0'];
      return colors[question.originalIndex % colors.length];
    }
    // Colors for emotional scale (gradient from red to green)
    else if (question.type === 'emotionalScale') {
      const totalLevels = emotionalScaleQuestions.length;
      const position = question.originalIndex / (totalLevels - 1); // Normalized position (0 to 1)
      
      // Red (low) to Yellow (middle) to Green (high)
      if (position < 0.5) {
        // Red to Yellow (normalize to 0-1 range)
        const normalizedPos = position * 2;
        return `rgb(255, ${Math.floor(255 * normalizedPos)}, 0)`;
      } else {
        // Yellow to Green (normalize to 0-1 range)
        const normalizedPos = (position - 0.5) * 2;
        return `rgb(${Math.floor(255 * (1 - normalizedPos))}, 255, 0)`;
      }
    }
    // Colors for general questions (purple gradient)
    else {
      const totalQuestions = fixedGeneralQuestions.length;
      const position = question.originalIndex / (totalQuestions - 1 || 1); // Normalized position (0 to 1)
      const intensity = Math.floor(155 + 100 * position); // 155-255 range for a lighter purple
      return `rgb(${intensity}, 0, ${intensity})`;
    }
  };

  const interpretSpiralResults = () => {
    const spiralLevels = ['Beige', 'Purple', 'Red', 'Blue', 'Orange', 'Green', 'Yellow', 'Turquoise'];
    const yesAnswers = spiralAnswers.reduce((acc, answer, index) => {
      if (answer) acc.push(index);
      return acc;
    }, [] as number[]);

    if (yesAnswers.length === 0) return 'No clear spiral level identified';

    // Find the most common level(s)
    const dominantLevels = yesAnswers.map(index => spiralLevels[index]);
    return `Your dominant spiral level(s): ${dominantLevels.join(', ')}`;
  };

  const interpretEmotionalResults = () => {
    // Count yes answers and their positions
    const yesAnswers = emotionalAnswers.reduce((acc, answer, index) => {
      if (answer) acc.push(index + 1); // +1 because emotional scale is 1-22
      return acc;
    }, [] as number[]);

    if (yesAnswers.length === 0) return 'No clear emotional level identified';

    // Calculate average emotional level
    const sum = yesAnswers.reduce((acc, level) => acc + level, 0);
    const average = Math.round(sum / yesAnswers.length);
    
    // Categorize the emotional level
    let category = '';
    if (average >= 1 && average <= 7) {
      category = 'Lower emotional states (negative feelings)';
    } else if (average >= 8 && average <= 14) {
      category = 'Transitional emotional states';
    } else if (average >= 15 && average <= 22) {
      category = 'Higher emotional states (positive feelings)';
    }
    
    return `Your emotional scale level: ${average}/22 - ${category}`;
  };
  
  const interpretGeneralResults = () => {
    // For general results, we'll provide a general interpretation
    const yesCount = generalAnswers.filter(answer => answer).length;
    const totalQuestions = fixedGeneralQuestions.length;
    const positivityScore = Math.round((yesCount / totalQuestions) * 100);
    
    let interpretation = '';
    if (positivityScore >= 70) {
      interpretation = 'Your responses indicate a generally positive outlook and higher emotional states.';
    } else if (positivityScore >= 40) {
      interpretation = 'Your responses indicate a balanced perspective with mixed emotional states.';
    } else {
      interpretation = 'Your responses indicate potential challenges with lower emotional states.';
    }
    
    return `${interpretation} (Positivity score: ${positivityScore}%)`;
  };

  return (
    <Container>
      <Box sx={{ p: 2, minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Nomodia Comprehensive Assessment
        </Typography>
        
        {!quizCompleted ? (
          <>
            <Box sx={{ position: 'relative', width: '100%', height: 300, my: 4 }}>
              {shuffledQuestions.length > 0 && (
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
                      borderLeft: `8px solid ${getColorForQuestion(shuffledQuestions[currentQuestionIndex])}`,
                      backgroundColor: `${getColorForQuestion(shuffledQuestions[currentQuestionIndex])}22`
                    }}
                  >
                    <Typography variant="h6" align="center">
                      {shuffledQuestions[currentQuestionIndex].text}
                    </Typography>
                  </Card>
                </motion.div>
              )}
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
                Question {currentQuestionIndex + 1} of {shuffledQuestions.length}
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
              Comprehensive Assessment Results
            </Typography>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Spiral Dynamics Results
              </Typography>
              <Typography variant="body1" paragraph>
                {interpretSpiralResults()}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                Emotional Scale Results
              </Typography>
              <Typography variant="body1" paragraph>
                {interpretEmotionalResults()}
              </Typography>
              
              <Typography variant="h6" gutterBottom>
                General Assessment Results
              </Typography>
              <Typography variant="body1" paragraph>
                {interpretGeneralResults()}
              </Typography>
              
              {/* Emotional Scale Visualization */}
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Emotional Scale Visualization
              </Typography>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ width: '100%', height: 60, display: 'flex', mb: 1 }}>
                  {Array.from({ length: 22 }).map((_, index) => {
                    // Create a gradient from red (negative) to green (positive)
                    const color = index < 7 ? 
                      `rgb(255, ${Math.floor((index/7) * 255)}, 0)` : 
                      index < 14 ? 
                        `rgb(${Math.floor(255 - ((index-7)/7) * 255)}, 255, 0)` : 
                        `rgb(0, 255, ${Math.floor(((index-14)/8) * 150)})`;                    
                    return (
                      <Box 
                        key={`scale-${index}`} 
                        sx={{ 
                          flex: 1, 
                          height: '100%', 
                          bgcolor: color,
                          borderRadius: index === 0 ? '4px 0 0 4px' : index === 21 ? '0 4px 4px 0' : 0,
                          position: 'relative'
                        }}
                      >
                        {(index + 1) % 3 === 0 && (
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              position: 'absolute', 
                              bottom: -20, 
                              left: '50%', 
                              transform: 'translateX(-50%)',
                              color: 'text.secondary'
                            }}
                          >
                            {index + 1}
                          </Typography>
                        )}
                      </Box>
                    );
                  })}
                </Box>
                
                {/* Marker for user's position */}
                {calculateEmotionalScore() > 0 && (
                  <Box sx={{ 
                    position: 'relative', 
                    width: '100%', 
                    height: 30,
                    mt: 3
                  }}>
                    <Box sx={{ 
                      position: 'absolute',
                      left: `${((calculateEmotionalScore() - 1) / 21) * 100}%`,
                      transform: 'translateX(-50%)',
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: 'black',
                      border: '3px solid white',
                      boxShadow: 3
                    }} />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        position: 'absolute',
                        left: `${((calculateEmotionalScore() - 1) / 21) * 100}%`,
                        top: 25,
                        transform: 'translateX(-50%)',
                        fontWeight: 'bold'
                      }}
                    >
                      Your score: {calculateEmotionalScore()}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Spiral Dynamics Visualization */}
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Spiral Dynamics Visualization
              </Typography>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['Beige', 'Purple', 'Red', 'Blue', 'Orange', 'Green', 'Yellow', 'Turquoise'].map((level, index) => {
                    const colors = ['#F5F5DC', '#800080', '#FF0000', '#0000FF', '#FFA500', '#008000', '#FFFF00', '#40E0D0'];
                    const isSelected = spiralAnswers[index];
                    return (
                      <Box key={`spiral-vis-${index}`} sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ width: 80 }}>{level}</Typography>
                        <Box 
                          sx={{ 
                            flex: 1, 
                            height: 30, 
                            bgcolor: isSelected ? colors[index] : `${colors[index]}44`,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            pl: 1,
                            border: isSelected ? '2px solid black' : 'none',
                            boxShadow: isSelected ? 2 : 0
                          }}
                        >
                          {isSelected && (
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: ['Yellow', 'Beige'].includes(level) ? 'black' : 'white',
                                fontWeight: 'bold'
                              }}
                            >
                              Selected
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
              
              <Typography variant="h6" sx={{ mt: 4 }} gutterBottom>
                Your answers by category:
              </Typography>
              
              <Typography variant="subtitle1" sx={{ mt: 3 }} gutterBottom>
                Spiral Dynamics Questions:
              </Typography>
              <Stack spacing={1}>
                {spiralDiagnosisQuestions.map((question, index) => (
                  <Box 
                    key={`spiral-${index}`} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: `${getColorForQuestion({text: question, type: 'spiralDynamics', originalIndex: index})}22`,
                      borderLeft: `4px solid ${getColorForQuestion({text: question, type: 'spiralDynamics', originalIndex: index})}`
                    }}
                  >
                    <Typography variant="body2" gutterBottom>
                      {question}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {spiralAnswers[index] ? "Yes" : "No"}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              
              <Typography variant="subtitle1" sx={{ mt: 3 }} gutterBottom>
                Emotional Scale Questions:
              </Typography>
              <Stack spacing={1}>
                {emotionalScaleQuestions.map((question, index) => (
                  <Box 
                    key={`emotional-${index}`} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: `${getColorForQuestion({text: question, type: 'emotionalScale', originalIndex: index})}22`,
                      borderLeft: `4px solid ${getColorForQuestion({text: question, type: 'emotionalScale', originalIndex: index})}`
                    }}
                  >
                    <Typography variant="body2" gutterBottom>
                      {question}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {emotionalAnswers[index] ? "Yes" : "No"}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              
              <Typography variant="subtitle1" sx={{ mt: 3 }} gutterBottom>
                General Questions:
              </Typography>
              <Stack spacing={1}>
                {fixedGeneralQuestions.map((question, index) => (
                  <Box 
                    key={`general-${index}`} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 1, 
                      bgcolor: `${getColorForQuestion({text: question, type: 'geminiGenerated', originalIndex: index})}22`,
                      borderLeft: `4px solid ${getColorForQuestion({text: question, type: 'geminiGenerated', originalIndex: index})}`
                    }}
                  >
                    <Typography variant="body2" gutterBottom>
                      {question}
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {generalAnswers[index] ? "Yes" : "No"}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                {!loading?<Button variant="contained" onClick={resetQuiz}>
                  Take New Quiz
                </Button>:"loading..."}
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default EnhancedQuizPage;
