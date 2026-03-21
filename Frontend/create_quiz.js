document.addEventListener("DOMContentLoaded", () => {
  const questionsContainer = document.getElementById("questions-container");
  const addQuestionBtn = document.getElementById("add-question-btn");
  const quizForm = document.getElementById("quiz-form");
  const quizTitleInput = document.getElementById("quiz-title");
  const quizDescriptionInput = document.getElementById("quiz-description");
  const quizDurationInput = document.getElementById("quiz-duration"); // New duration input
  const cancelBtn = document.getElementById("cancel-btn");

  let questionCounter = 0;
  let quizId = null;

  const addQuestion = (data = {}) => {
    questionCounter++;
    const questionBlock = document.createElement("div");
    questionBlock.classList.add("question-block");

    questionBlock.innerHTML = `
      <h3>Question ${questionCounter}</h3>
      <div class="form-group">
        <label>Question Text</label>
        <input type="text" name="question-${questionCounter}-text" required autocomplete="off" value="${data.question || ''}">
      </div>
      <div class="form-group">
        <label>Answers</label>
        <div class="answer-list">
          ${[1,2,3,4].map(i => `
            <div class="answer-item">
              <span>Option ${i}</span>
              <input type="text" name="question-${questionCounter}-answer-${i}" ${i <= 2 ? "required" : ""} autocomplete="off" value="${data.answers?.[i-1]?.text || ''}">
              <div class="correct-selection">
                <label>Correct</label>
                <input type="radio" name="question-${questionCounter}-correct" value="${i}" ${data.answers?.[i-1]?.correct ? "checked" : ""} ${i === 1 ? "required" : ""}>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    questionsContainer.appendChild(questionBlock);
  };

  addQuestionBtn.addEventListener("click", () => addQuestion());

  document.getElementById('discard-btn').addEventListener('click', () => {
  const confirmDiscard = confirm("Are you sure you want to discard changes?");
  if (confirmDiscard) {
    window.location.href = 'dashboard.html'; // redirect to dashboard
  }
});

  const params = new URLSearchParams(window.location.search);
  quizId = params.get("quizId");

  if (quizId) {
    fetch(`/api/quizzes/${quizId}`)
      .then(res => res.json())
      .then(quiz => {
        quizTitleInput.value = quiz.title;
        quizDescriptionInput.value = quiz.description;
        quizDurationInput.value = quiz.duration;

        questionsContainer.innerHTML = '';
        questionCounter = 0;
        quiz.questions.forEach(q => addQuestion(q));
      })
      .catch(err => {
        console.error(err);
        alert("Failed to load quiz for editing.");
      });
  } else {
    addQuestion(); 
  }

  quizForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert('Please login first!');
      window.location.href = 'login.html';
      return;
    }

    const duration = parseInt(quizDurationInput.value.trim()) || 5; // default 5 mins

    const quizData = {
      title: quizTitleInput.value,
      description: quizDescriptionInput.value,
      duration: duration,
      questions: [],
      userId: user.id || user.email
    };

    const questionBlocks = document.querySelectorAll(".question-block");
    questionBlocks.forEach((block, index) => {
      const questionText = block.querySelector(`input[name="question-${index+1}-text"]`).value.trim();
      const answers = [];
      const correctOptionInput = block.querySelector(`input[name="question-${index+1}-correct"]:checked`);

      for (let i = 1; i <= 4; i++) {
        const answerInput = block.querySelector(`input[name="question-${index+1}-answer-${i}"]`);
        if (answerInput && answerInput.value.trim()) {
          answers.push({
            text: answerInput.value.trim(),
            correct: correctOptionInput && correctOptionInput.value == i
          });
        }
      }

      if (questionText && answers.length >= 2) {
        quizData.questions.push({ question: questionText, answers });
      }
    });

    try {
      const url = quizId ? `/api/quizzes/${quizId}` : '/api/quizzes';
      const method = quizId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to save quiz');

      alert(quizId ? 'Quiz updated successfully!' : 'Quiz created successfully!');
      window.location.href = "dashboard.html";
    } catch (err) {
      console.error(err);
      alert('Error saving quiz. Try again.');
    }
  });
});
