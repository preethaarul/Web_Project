const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let users = [];
let quizzes = [];
let results = [];

// Default quizzes
let defaultQuizzes = [
  {
    id: 'default1',
    title: 'General Knowledge Quiz',
    description: 'Test your general knowledge!',
    questions: [
      {
        question: 'What is the capital of France?',
        answers: [
          { text: 'Paris', correct: true },
          { text: 'London', correct: false },
          { text: 'Berlin', correct: false },
          { text: 'Rome', correct: false }
        ]
      },
      {
        question: '2 + 2 = ?',
        answers: [
          { text: '3', correct: false },
          { text: '4', correct: true },
          { text: '5', correct: false },
          { text: '6', correct: false }
        ]
      },
      {
        question: 'Which planet is known as the Red Planet?',
        answers: [
          { text: 'Mars', correct: true },
          { text: 'Earth', correct: false },
          { text: 'Venus', correct: false },
          { text: 'Jupiter', correct: false }
        ]
      },
      {
        question: 'Who wrote "Romeo and Juliet"?',
        answers: [
          { text: 'Shakespeare', correct: true },
          { text: 'Hemingway', correct: false },
          { text: 'Dickens', correct: false },
          { text: 'Tolkien', correct: false }
        ]
      },
      {
        question: 'Water boils at ?',
        answers: [
          { text: '100°C', correct: true },
          { text: '90°C', correct: false },
          { text: '50°C', correct: false },
          { text: '120°C', correct: false }
        ]
      }
    ],
    createdBy: 'default',
    duration: 5
  }
];


// Register
app.post('/api/register', (req, res) => {
  const { email, password, fullname } = req.body;

  if (!email || !password || !fullname) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  users.push({ email, password, fullname });
  res.json({ message: 'Registered successfully' });
});

// Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(400).json({ message: 'User not registered' });
  }

  if (user.password !== password) {
    return res.status(400).json({ message: 'Incorrect password' });
  }

  res.json({
    message: 'Login successful',
    user: { email: user.email, fullname: user.fullname } // frontend expects .fullname
  });
});

// QUIZ ROUTES  

// Create quiz
app.post('/api/quizzes', (req, res) => {
  const { userId, title, description, questions, duration } = req.body;

  if (!title || !questions || questions.length === 0) {
    return res.status(400).json({ message: 'Title and questions are required' });
  }

  const quiz = {
    id: Date.now().toString(),
    title,
    description: description || '',
    questions,
    createdBy: userId || 'default',
    duration: duration || 5
  };

  quizzes.push(quiz);
  res.json({ message: 'Quiz created', quiz });
});

// Update quiz
app.put('/api/quizzes/:id', (req, res) => {
  const { id } = req.params;
  const index = quizzes.findIndex(q => q.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  quizzes[index] = {
    ...quizzes[index],
    ...req.body
  };

  res.json({ message: 'Quiz updated', quiz: quizzes[index] });
});

// Get all quizzes
app.get('/api/quizzes', (req, res) => {
  res.json([...defaultQuizzes, ...quizzes]);
});

// Get quiz by ID
app.get('/api/quizzes/:id', (req, res) => {
  const quiz = [...defaultQuizzes, ...quizzes].find(
    q => q.id === req.params.id
  );

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  res.json(quiz);
});

//   RESULTS ROUTES  

// Save result
app.post('/api/results', (req, res) => {
  const { topic, score, total, date, questions } = req.body;

  if (!topic || score == null || total == null) {
    return res.status(400).json({ message: 'Invalid result data' });
  }

  results.push({
    topic,
    score,
    total,
    date: date || new Date().toISOString(),
    questions: questions || []
  });

  res.json({ message: 'Result saved' });
});

// Get all results
app.get('/api/results', (req, res) => {
  res.json(results);
});

// Export for Vercel
module.exports = app;