const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'Frontend')));

const bootId = Date.now().toString();

let users = [];
let quizzes = [];
let results = [];

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
    createdBy: 'default'
  },
  {
    id: 'default2',
    title: 'Science Quiz',
    description: 'Basic science questions!',
    questions: [
      {
        question: 'The chemical symbol for water is?',
        answers: [
          { text: 'H2O', correct: true },
          { text: 'O2', correct: false },
          { text: 'CO2', correct: false },
          { text: 'HO', correct: false }
        ]
      },
      {
        question: 'How many planets are in the solar system?',
        answers: [
          { text: '8', correct: true },
          { text: '9', correct: false },
          { text: '7', correct: false },
          { text: '10', correct: false }
        ]
      },
      {
        question: 'Light travels at?',
        answers: [
          { text: '3x10^8 m/s', correct: true },
          { text: '1x10^6 m/s', correct: false },
          { text: '3x10^6 m/s', correct: false },
          { text: '5x10^8 m/s', correct: false }
        ]
      },
      {
        question: 'Earth is a?',
        answers: [
          { text: 'Planet', correct: true },
          { text: 'Star', correct: false },
          { text: 'Moon', correct: false },
          { text: 'Comet', correct: false }
        ]
      },
      {
        question: 'The force that keeps us on the ground?',
        answers: [
          { text: 'Gravity', correct: true },
          { text: 'Magnetism', correct: false },
          { text: 'Friction', correct: false },
          { text: 'Electricity', correct: false }
        ]
      }
    ],
    createdBy: 'default'
  }
];

app.post('/api/register', (req, res) => {
  const { email, password, fullname } = req.body;

  if (!email || !password || !fullname) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ message: 'User already exists' });
  }

  users.push({ email, password, fullname });
  res.json({ message: 'Registered successfully', bootId });
});

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
    user: { email: user.email, fullname: user.fullname },
    bootId
  });
});

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

app.get('/api/quizzes', (req, res) => {
  res.json([...defaultQuizzes, ...quizzes]);
});

app.get('/api/quizzes/:id', (req, res) => {
  const quiz = [...defaultQuizzes, ...quizzes].find(
    q => q.id === req.params.id
  );

  if (!quiz) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  res.json(quiz);
});

app.post('/api/results', (req, res) => {
  const { topic, score, total, date } = req.body;

  if (!topic || score == null || total == null) {
    return res.status(400).json({ message: 'Invalid result data' });
  }

  results.push({
    topic,
    score,
    total,
    date: date || new Date().toISOString()
  });

  res.json({ message: 'Result saved' });
});

app.get('/api/results', (req, res) => {
  res.json(results);
});

app.get('/api/boot', (req, res) => {
  res.json({ bootId });
});

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(process.cwd(), 'Frontend', 'index.html'));
});

module.exports = app;
