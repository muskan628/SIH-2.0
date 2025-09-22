const quizQuestions = [
  {q:"What is the full form of DBMS?", options:["Database Management System","Data Block Manage System","Drive Base Memory System","None"], answer:0},
  {q:"Which of these is a frontend language?", options:["Python","HTML","C","SQL"], answer:1}
];
let quizIndex=0, score=0;

function loadQuiz(){
  document.getElementById("quizQ").innerText = quizQuestions[quizIndex].q;
  const optsDiv = document.getElementById("quizOptions");
  optsDiv.innerHTML="";
  quizQuestions[quizIndex].options.forEach((opt,i)=>{
    const btn=document.createElement("button");
    btn.innerText=opt;
    btn.onclick=()=>checkAnswer(i);
    optsDiv.appendChild(btn);
  });
}

function checkAnswer(i){
  if(i === quizQuestions[quizIndex].answer) score++;
  quizIndex++;
  if(quizIndex < quizQuestions.length) {
    loadQuiz();
  } else {
    document.getElementById("quizQ").innerText = "Quiz Completed ✅";
  }
  document.getElementById("quizOptions").innerHTML = "";
  document.getElementById("scoreDisplay").innerText = `Score: ${score}/${quizQuestions.length}`;
}

loadQuiz();
