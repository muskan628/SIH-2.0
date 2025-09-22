const sidebar = document.getElementById('sidebar');
document.getElementById('menuToggle').addEventListener('click', () => sidebar.classList.toggle('active'));

// Example MCQs
const questions = [
  {q: "HTML stands for?", options:["Hyper Text Markup Language","High Transfer Main Language","Home Tool Markup Language","Hyperlinks Text Machine Language"], answer:0},
  {q: "CSS is used for?", options:["Database Management","Styling Web Pages","Programming Logic","Machine Learning"], answer:1},
  {q: "Which tag is used for JavaScript?", options:["<script>","<js>","<java>","<code>"], answer:0}
];

let currentQ = 0;
let selectedAnswers = new Array(questions.length).fill(null);

// Populate Question
function loadQuestion() {
  document.getElementById("questionText").innerText = questions[currentQ].q;
  const optionsDiv = document.getElementById("optionsContainer");
  optionsDiv.innerHTML = "";
  
  questions[currentQ].options.forEach((opt, idx) => {
    const label = document.createElement("label");
    // ✅ FIX: use backticks for template literal
    label.innerHTML = `<input type="radio" name="option" 
      ${selectedAnswers[currentQ] === idx ? "checked" : ""} 
      onclick="selectOption(${idx})"> ${opt}`;
    optionsDiv.appendChild(label);  // Add label to the optionsDiv
  });
}

function selectOption(index) {
  selectedAnswers[currentQ] = index; 
}

function nextQuestion() {
  if (currentQ < questions.length - 1) { 
    currentQ++; 
    loadQuestion(); 
  } else { 
    alert("Exam Completed! Submitting Answers..."); 
  }
}

function prevQuestion() {
  if (currentQ > 0) { 
    currentQ--; 
    loadQuestion(); 
  }
}

loadQuestion();

// Timer
let timeLeft = 300;
const timer = document.getElementById("timer");
const countdown = setInterval(() => {
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;
  // ✅ FIX: use backticks for string interpolation
  timer.innerText = `Time Left: ${minutes}:${seconds.toString().padStart(2, '0')}`;
  if (timeLeft <= 0) {
    clearInterval(countdown);
    alert("Time Over! Submitting...");
  }
  timeLeft--;
}, 1000);
