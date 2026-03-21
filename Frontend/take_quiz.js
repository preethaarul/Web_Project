let currentQuiz = [];
let currentQuestionIndex = 0;
let selectedAnswers = [];
let quizId = null;

let quizDuration = 0;
let timeRemaining = 0;
let timerInterval = null;

// defqz
const defaultQuizzes = [
  {
    id: 'default1',
    title: 'General Knowledge Quiz',
    description: 'Test your general knowledge!',
    duration: 5,
    questions: [
      { question: 'What is the capital of France?', answers: [{text:'Paris', correct:true},{text:'London', correct:false},{text:'Berlin', correct:false},{text:'Madrid', correct:false}] },
      { question: 'Which planet is known as the Red Planet?', answers: [{text:'Mars', correct:true},{text:'Earth', correct:false},{text:'Jupiter', correct:false},{text:'Venus', correct:false}] },
      { question: 'Who wrote "Hamlet"?', answers: [{text:'Shakespeare', correct:true},{text:'Tolstoy', correct:false},{text:'Hemingway', correct:false},{text:'Dickens', correct:false}] },
      { question: 'What is the largest ocean?', answers: [{text:'Pacific', correct:true},{text:'Atlantic', correct:false},{text:'Indian', correct:false},{text:'Arctic', correct:false}] },
      { question: 'How many continents are there?', answers: [{text:'7', correct:true},{text:'5', correct:false},{text:'6', correct:false},{text:'8', correct:false}] }
    ]
  },
  {
    id: 'default2',
    title: 'Science Quiz',
    description: 'A small science quiz to challenge you!',
    duration: 5,
    questions: [
      { question: 'Water freezes at?', answers: [{text:'0°C', correct:true},{text:'100°C', correct:false},{text:'50°C', correct:false},{text:'-10°C', correct:false}] },
      { question: 'H2O is the chemical formula of?', answers: [{text:'Water', correct:true},{text:'Oxygen', correct:false},{text:'Hydrogen', correct:false},{text:'Salt', correct:false}] },
      { question: 'The center of an atom is called?', answers: [{text:'Nucleus', correct:true},{text:'Electron', correct:false},{text:'Proton', correct:false},{text:'Neutron', correct:false}] },
      { question: 'The gas we breathe in is?', answers: [{text:'Oxygen', correct:true},{text:'Carbon dioxide', correct:false},{text:'Nitrogen', correct:false},{text:'Helium', correct:false}] },
      { question: 'The planet closest to the Sun?', answers: [{text:'Mercury', correct:true},{text:'Venus', correct:false},{text:'Earth', correct:false},{text:'Mars', correct:false}] }
    ]
  }
];


function renderDefaultQuizzes() {
  const container = document.getElementById('default-quiz-cards');
  if (!container) return;
  container.innerHTML = '';
  defaultQuizzes.forEach(quiz => {
    const card = document.createElement('div');
    card.className = 'quiz-card';
    card.innerHTML = `
      <h3>${quiz.title}</h3>
      <p>${quiz.description}</p>
      <button class="start-quiz-btn reg-btn" onclick="startQuiz('${quiz.id}')">Start Quiz</button>
    `;
    container.appendChild(card);
  });
}

//searchqz
const searchInput = document.getElementById('quiz-search-input');

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  const container = document.getElementById('default-quiz-cards');
  const cards = container.querySelectorAll('.quiz-card');

  cards.forEach(card => {
    const titleElem = card.querySelector('h3');
    const descElem = card.querySelector('p');
    const titleText = titleElem.dataset.original || titleElem.innerText;
    const descText = descElem.innerText;

    if (!titleElem.dataset.original) titleElem.dataset.original = titleText;

    titleElem.innerHTML = titleText;

    if (query === '' || titleText.toLowerCase().includes(query) || descText.toLowerCase().includes(query)) {
      card.style.display = 'block';

      if (query !== '') {
        const regex = new RegExp(`(${query})`, 'gi');
        titleElem.innerHTML = titleText.replace(regex, '<span class="quiz-highlight">$1</span>');
      }
    } else {
      card.style.display = 'none';
    }
  });
});


//start
function startQuiz(id) {
  let quiz = defaultQuizzes.find(q => q.id === id);
  if (!quiz) return alert('Quiz not found');

  currentQuiz = quiz.questions;
  selectedAnswers = Array(currentQuiz.length).fill(null);
  currentQuestionIndex = 0;


  quizDuration = (quiz.duration || 5) * 60;
  timeRemaining = quizDuration;
  startTimer();

  document.querySelector('.form-container').style.display = 'none';
  document.querySelector('.quiz-list-container').style.display = 'none';
  document.getElementById('quiz-container').style.display = 'block';
  document.getElementById('quiz-title').innerText = quiz.title;

  showQuestion();
}

function startTimer() {
  const timerElement = document.getElementById('timer');
  if (!timerElement) return;
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    let minutes = Math.floor(timeRemaining / 60);
    let seconds = timeRemaining % 60;
    timerElement.textContent = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;

    if (timeRemaining <= 60) timerElement.style.color = '#ca0112';

    if (timeRemaining <= 0) {
      clearInterval(timerInterval);
      alert("Time's up! Submitting your quiz.");
      submitQuiz();
    }

    if (timeRemaining <= 60) timerElement.style.color = '#ca0112';
    timeRemaining--;
  }, 1000);
}

//join qz
document.getElementById('join-quiz-btn').addEventListener('click', () => {
  const inputId = document.getElementById('quiz-id-input').value.trim();
  if (!inputId) return alert('Please enter a quiz ID.');
  window.location.href = `TakeQuiz.html?quizId=${inputId}`;
});

//load qz
window.addEventListener('DOMContentLoaded', async () => {
  renderDefaultQuizzes();
  const params = new URLSearchParams(window.location.search);
  quizId = params.get('quizId');
  if (!quizId) return;

  try {
    const res = await fetch(`/api/quizzes/${quizId}`);
    if (!res.ok) throw new Error('Quiz not found');
    const quiz = await res.json();

    currentQuiz = quiz.questions;
    selectedAnswers = Array(currentQuiz.length).fill(null);
    currentQuestionIndex = 0;

    quizDuration = (quiz.duration || 5) * 60;
    timeRemaining = quizDuration;
    startTimer();

    document.querySelector('.form-container').style.display = 'none';
    document.querySelector('.quiz-list-container').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('quiz-title').innerText = quiz.title;

    showQuestion();
  } catch (err) {
    console.error(err);
    alert('Failed to load quiz! Please check the Quiz ID.');
  }
});


function showQuestion() {
  const container = document.getElementById('question-container');
  container.innerHTML = '';
  const q = currentQuiz[currentQuestionIndex];
  const questionElem = document.createElement('div');
  questionElem.className = 'quiz-question';
  questionElem.innerHTML = `<h3>Q${currentQuestionIndex + 1}: ${q.question}</h3>`;

  const optionsElem = document.createElement('div');
  optionsElem.className = 'quiz-options';
  const shuffledAnswers = [...q.answers].sort(() => Math.random() - 0.5);
  shuffledAnswers.forEach((ans, index) => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="radio" name="option" value="${index}" ${
      selectedAnswers[currentQuestionIndex] === index ? 'checked' : ''
    }> ${ans.text}`;
    optionsElem.appendChild(label);
  });
  q.shuffledAnswers = shuffledAnswers;

  container.appendChild(questionElem);
  container.appendChild(optionsElem);

  document.getElementById('prev-btn').style.display = currentQuestionIndex === 0 ? 'none' : 'inline-block';
  document.getElementById('next-btn').style.display = currentQuestionIndex === currentQuiz.length - 1 ? 'none' : 'inline-block';
  document.getElementById('submit-btn').style.display = currentQuestionIndex === currentQuiz.length - 1 ? 'inline-block' : 'none';
}

//nav
function nextQuestion() { saveAnswer(); if (currentQuestionIndex < currentQuiz.length - 1) { currentQuestionIndex++; showQuestion(); } }
function prevQuestion() { saveAnswer(); if (currentQuestionIndex > 0) { currentQuestionIndex--; showQuestion(); } }
function saveAnswer() { const selected = document.querySelector('input[name="option"]:checked'); if (selected) selectedAnswers[currentQuestionIndex] = parseInt(selected.value); }

//submit
async function submitQuiz() {
  saveAnswer();
  clearInterval(timerInterval);

  let score = 0;
  const questionData = currentQuiz.map((q, i) => {
    const userSelectedIndex = selectedAnswers[i];
    const answers = q.shuffledAnswers.map((a, idx) => ({
      text: a.text,
      correct: a.correct,
      selected: idx === userSelectedIndex
    }));
    if (q.shuffledAnswers[userSelectedIndex]?.correct) score++;
    return { question: q.question, answers };
  });

  const quizTopic = document.getElementById('quiz-title').innerText;

  try {
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: quizTopic,
        score,
        total: currentQuiz.length,
        date: new Date().toISOString(),
        questions: questionData
      })
    });
    if (!res.ok) throw new Error('Failed to save result');

    localStorage.setItem('latestResult', JSON.stringify({ topic: quizTopic, score, total: currentQuiz.length, questions: questionData }));
    window.location.href = 'results.html';
  } catch (err) {
    console.error(err);
    alert('Failed to submit quiz. Try again.');
  }
}
