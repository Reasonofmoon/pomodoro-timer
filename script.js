
const timer = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionType = document.getElementById('sessionType');
const sessionCount = document.getElementById('sessionCount');
const subjectSelect = document.getElementById('subjectSelect');
const workTimeInput = document.getElementById('workTime');
const breakTimeInput = document.getElementById('breakTime');
const statsList = document.getElementById('statslist');
const alarmSound = document.getElementById('alarmSound');

let interval;
let timeLeft;
let isRunning = false;
let isWorkSession = true;
let currentSession = 1;
let stats = {};

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    sessionType.textContent = isWorkSession ? '작업 시간' : '휴식 시간';
    sessionCount.textContent = `세션: ${currentSession}/4`;
    
    // 과목 또는 휴식에 따른 타이머 배경색 변경
    timer.className = 'timer ' + (isWorkSession ? subjectSelect.value : 'break');
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        interval = setInterval(() => {
            timeLeft--;
            updateDisplay();
            if (timeLeft === 0) {
                clearInterval(interval);
                alarmSound.play();
                if (isWorkSession) {
                    // 작업 세션 완료 시 통계 업데이트
                    const subject = subjectSelect.value;
                    stats[subject] = (stats[subject] || 0) + 1;
                    updateStats();
                    
                    if (currentSession < 4) {
                        timeLeft = breakTimeInput.value * 60;
                        isWorkSession = false;
                        currentSession++;
                    } else {
                        timeLeft = breakTimeInput.value * 60 * 3; // 긴 휴식
                        isWorkSession = false;
                        currentSession = 1;
                    }
                } else {
                    timeLeft = workTimeInput.value * 60;
                    isWorkSession = true;
                }
                updateDisplay();
                startTimer();
            }
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(interval);
    isRunning = false;
}

function resetTimer() {
    clearInterval(interval);
    isRunning = false;
    timeLeft = workTimeInput.value * 60;
    isWorkSession = true;
    currentSession = 1;
    updateDisplay();
}

function updateStats() {
    statsList.innerHTML = '';
    for (const [subject, count] of Object.entries(stats)) {
        const li = document.createElement('li');
        li.textContent = `${subject}: ${count} 포모도로`;
        statsList.appendChild(li);
    }
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

subjectSelect.addEventListener('change', () => {
    if (isWorkSession) {
        timer.className = 'timer ' + subjectSelect.value;
    }
});

workTimeInput.addEventListener('change', () => {
    if (!isRunning && isWorkSession) {
        timeLeft = workTimeInput.value * 60;
        updateDisplay();
    }
});

breakTimeInput.addEventListener('change', () => {
    if (!isRunning && !isWorkSession) {
        timeLeft = breakTimeInput.value * 60;
        updateDisplay();
    }
});

// 초기 설정
timeLeft = workTimeInput.value * 60;
updateDisplay();
