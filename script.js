const progressBar = document.querySelector(".progress-bar");
const progressText = document.querySelector(".progress-text");
const startBtn = document.querySelector(".start");
const numQuestions = document.querySelector("#num-questions");
const category = document.querySelector("#category");
const difficulty = document.querySelector("#difficulty");
const timePerQuestion = document.querySelector("#time");
const quiz = document.querySelector(".quiz");
const startScreen = document.querySelector(".start-screen");
const submitBtn = document.querySelector(".submit");
const nextBtn = document.querySelector(".next");
const endScreen = document.querySelector(".end-screen");
const finalScore = document.querySelector(".final-score");
const totalScore = document.querySelector(".total-score");
const restartBtn = document.querySelector(".restart");

const questions = [];
let time = 30;
let score = 0;
let currentQuestion;
let timer;

const progress = (value) => {
  const percentage = (value / time) * 100;
  progressBar.style.width = `${percentage}%`;
  progressText.innerHTML = `${value}`;
};

const playAudio = (src) => {
  const audio = new Audio(src);
  audio.play();
};

const loadingAnimation = () => {
  startBtn.innerHTML = "Loading";
  const loadingInterval = setInterval(() => {
    startBtn.innerHTML = startBtn.innerHTML.length === 10 ? "Starting Quiz" : startBtn.innerHTML + ".";
  }, 500);
};

const markCorrectAnswer = () => {
  document.querySelectorAll(".answer").forEach((answer) => {
    if (
      answer.querySelector(".text").innerHTML ===
      questions[currentQuestion - 1].correct_answer
    ) {
      answer.classList.add("correct");
    }
  });
};

const showScore = () => {
  endScreen.classList.remove("hide");
  quiz.classList.add("hide");
  finalScore.innerHTML = score;
  totalScore.innerHTML = `/ ${questions.length}`;
};

const nextQuestion = () => {
  if (currentQuestion < questions.length) {
    currentQuestion++;
    showQuestion(questions[currentQuestion - 1]);
  } else {
    showScore();
  }
};

const checkAnswer = () => {
  clearInterval(timer);
  const selectedAnswer = document.querySelector(".answer.selected");
  if (selectedAnswer) {
    const answer = selectedAnswer.querySelector(".text").innerHTML;
    if (answer === questions[currentQuestion - 1].correct_answer) {
      score++;
      selectedAnswer.classList.add("correct");
    } else {
      selectedAnswer.classList.add("wrong");
      markCorrectAnswer();
    }
  } else {
    markCorrectAnswer();
  }
  
  document.querySelectorAll(".answer").forEach((answer) => {
    answer.classList.add("checked");
  });

  submitBtn.style.display = "none";
  nextBtn.style.display = "block";

  setTimeout(() => {
    nextQuestion();
    submitBtn.style.display = "block";
    nextBtn.style.display = "none";
  }, 1000);
};

const startTimer = (time) => {
  timer = setInterval(() => {
    if (time === 3) {
      playAudio("countdown.mp3");
    }
    if (time >= 0) {
      progress(time);
      time--;
    } else {
      checkAnswer();
    }
  }, 1000);
};

const showQuestion = (question) => {
  const questionText = document.querySelector(".question");
  const answersWrapper = document.querySelector(".answer-wrapper");
  const questionNumber = document.querySelector(".number");

  questionText.innerHTML = question.question;

  const answers = [
    ...question.incorrect_answers,
    question.correct_answer.toString(),
  ];
  answersWrapper.innerHTML = "";
  answers.sort(() => Math.random() - 0.5);
  answers.forEach((answer) => {
    answersWrapper.innerHTML += `
      <div class="answer">
        <span class="text">${answer}</span>
        <span class="checkbox">
          <i class="fas fa-check"></i>
        </span>
      </div>
    `;
  });

  questionNumber.innerHTML = `Question <span class="current">${
    questions.indexOf(question) + 1
  }</span>
  <span class="total">/${questions.length}</span>`;

  const answersDiv = document.querySelectorAll(".answer");
  answersDiv.forEach((answer) => {
    answer.addEventListener("click", () => {
      if (!answer.classList.contains("checked")) {
        answersDiv.forEach((a) => a.classList.remove("selected"));
        answer.classList.add("selected");
        submitBtn.disabled = false;
      }
    });
  });

  time = Number(timePerQuestion.value);
  startTimer(time);
};

const startQuiz = async () => {
  const { value: num } = numQuestions;
  const { value: cat } = category;
  const { value: diff } = difficulty;
  loadingAnimation();
  const url = `https://opentdb.com/api.php?amount=${num}&category=${cat}&difficulty=${diff}&type=multiple`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    questions.push(...data.results);
    setTimeout(() => {
      startScreen.classList.add("hide");
      quiz.classList.remove("hide");
      currentQuestion = 1;
      showQuestion(questions[0]);
    }, 1000);
  } catch (error) {
    console.error("Error fetching questions:", error);
  }
};

startBtn.addEventListener("click", startQuiz);
submitBtn.addEventListener("click", checkAnswer);
nextBtn.addEventListener("click", nextQuestion);
restartBtn.addEventListener("click", () => {
  window.location.reload();
});