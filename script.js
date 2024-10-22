const quizContainer = document.getElementById('quiz')
const questionNumberElement = document.getElementById('question-number')
const questionElement = document.getElementById('question')
const optionsElement = document.getElementById('options')
const timerElement = document.getElementById('timer')
const resultsElement = document.getElementById('results')
const resultsTableBody = document.querySelector('#results-table tbody')

const TOTAL_QUESTIONS = 10
let questions = []
let currentQuestion = 0
let answers = new Array(TOTAL_QUESTIONS).fill(null)
let timer = 30
let isAnswerable = false
let intervalId

async function fetchQuestions() {
	try {
		const response = await fetch('https://jsonplaceholder.typicode.com/posts')
		const data = await response.json()
		questions = data.slice(0, TOTAL_QUESTIONS).map(q => ({
			...q,
			options: generateOptions(q.body),
		}))
		displayQuestion()
		startTimer()
	} catch (error) {
		console.error('Error fetching questions:', error)
	}
}

function generateOptions(text) {
	const words = text.split(' ').filter(word => word.length > 3)
	const options = words
		.slice(0, 4)
		.map(word => word.charAt(0).toUpperCase() + word.slice(1))
	return ['A', 'B', 'C', 'D'].map((letter, index) => ({
		letter,
		text: options[index] || 'Option ' + letter,
	}))
}

function displayQuestion() {
	const question = questions[currentQuestion]
	questionNumberElement.textContent = `Question ${
		currentQuestion + 1
	} of ${TOTAL_QUESTIONS}`
	questionElement.textContent = question.title
	optionsElement.innerHTML = ''
	question.options.forEach(option => {
		const button = document.createElement('button')
		button.textContent = `${option.letter}. ${option.text}`
		button.disabled = true
		button.addEventListener('click', () => handleAnswer(option.letter))
		optionsElement.appendChild(button)
	})
}

function startTimer() {
	timer = 30
	isAnswerable = false
	updateTimerDisplay()
	intervalId = setInterval(() => {
		timer--
		updateTimerDisplay()
		if (timer === 20) {
			isAnswerable = true
			enableOptions()
		}
		if (timer === 0) {
			clearInterval(intervalId)
			nextQuestion()
		}
	}, 1000)
}

function updateTimerDisplay() {
	timerElement.textContent = `Time remaining: ${timer} seconds`
}

function enableOptions() {
	const buttons = optionsElement.querySelectorAll('button')
	buttons.forEach(button => (button.disabled = false))
}

function handleAnswer(answer) {
	if (isAnswerable) {
		answers[currentQuestion] = answer
		nextQuestion()
	}
}

function nextQuestion() {
	clearInterval(intervalId)
	currentQuestion++
	if (currentQuestion < TOTAL_QUESTIONS) {
		displayQuestion()
		startTimer()
	} else {
		showResults()
	}
}

function showResults() {
	quizContainer.style.display = 'none'
	resultsElement.style.display = 'block'
	answers.forEach((answer, index) => {
		const row = resultsTableBody.insertRow()
		const questionCell = row.insertCell(0)
		const answerCell = row.insertCell(1)
		questionCell.textContent = `Question ${index + 1}`
		if (answer) {
			answerCell.textContent = answer
		} else {
			answerCell.textContent = 'Unanswered'
			answerCell.classList.add('unanswered')
		}
	})
}

fetchQuestions()
