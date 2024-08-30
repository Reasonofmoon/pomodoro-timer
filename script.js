let interval;
let timeLeft;
let isRunning = false;
let isWorkSession = true;
let currentSession = 1;
let stats = JSON.parse(localStorage.getItem('pomodoroStats')) || {};
let goals = JSON.parse(localStorage.getItem('pomodoroGoals')) || {};

// DOM elements
const timer = document.getElementById('timer');
const sessionType = document.getElementById('sessionType');
const sessionCount = document.getElementById('sessionCount');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const workTimeInput = document.getElementById('workTime');
const breakTimeInput = document.getElementById('breakTime');
const subjectSelect = document.getElementById('subjectSelect');
const alarmSound = document.getElementById('alarmSound');

// Initialize the display
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    sessionType.textContent = isWorkSession ? '작업 시간' : '휴식 시간';
    sessionCount.textContent = `세션: ${currentSession}/4`;
    timer.className = isWorkSession ? subjectSelect.value : 'break';
    document.body.className = isWorkSession ? subjectSelect.value : 'break'; // 과목명에 따라 배경색 변경
}

// Initialize or reset the timer
function initializeTimer() {
    clearInterval(interval);
    timeLeft = workTimeInput.value * 60;
    isWorkSession = true;
    currentSession = 1;
    updateDisplay();
}

// Start the timer
function startTimer() {
    if (isRunning) {
        alert("타이머가 이미 실행 중입니다.");
        return;
    }
    
    isRunning = true;
    interval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            clearInterval(interval);
            alarmSound.play(); // 타이머 종료 시에만 알람 소리 재생
            handleSessionEnd();
        }
    }, 1000);
}

// Pause the timer
function pauseTimer() {
    clearInterval(interval);
    isRunning = false;
}

// Reset the timer
function resetTimer() {
    isRunning = false;
    initializeTimer();
}

// Handle the end of a session
function handleSessionEnd() {
    if (isWorkSession) {
        // Update stats
        const subject = subjectSelect.value;
        const today = new Date().toISOString().split('T')[0];
        if (!stats[today]) stats[today] = {};
        if (!stats[today][subject]) stats[today][subject] = 0;
        stats[today][subject]++;
        localStorage.setItem('pomodoroStats', JSON.stringify(stats));

        // Update the session state
        if (currentSession < 4) {
            timeLeft = breakTimeInput.value * 60;
            isWorkSession = false;
            currentSession++;
        } else {
            timeLeft = breakTimeInput.value * 60 * 3; // Long break
            isWorkSession = false;
            currentSession = 1;
        }
    } else {
        timeLeft = workTimeInput.value * 60;
        isWorkSession = true;
    }
    updateDisplay();
    isRunning = false;
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Initialize the timer on page load
initializeTimer();
alarmSound.load(); // 알람 사전 로드
