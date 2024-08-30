let interval;
let timeLeft;
let isRunning = false;
let isWorkSession = true;
let currentSession = 1;

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    sessionType.textContent = isWorkSession ? '작업 시간' : '휴식 시간';
    sessionCount.textContent = `세션: ${currentSession}/4`;
    timer.className = 'timer ' + (isWorkSession ? subjectSelect.value : 'break');
}

function startTimer() {
    if (!isRunning) {
        isRunning = true;
        interval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                clearInterval(interval);
                alarmSound.play();
                if (isWorkSession) {
                    const subject = subjectSelect.value;
                    const today = new Date().toISOString().split('T')[0];
                    if (!stats[today]) stats[today] = {};
                    if (!stats[today][subject]) stats[today][subject] = 0;
                    stats[today][subject]++;
                    localStorage.setItem('pomodoroStats', JSON.stringify(stats));
                    updateStats();
                    updateAchievements();
                    
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
                isRunning = false;
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

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// 초기 설정
timeLeft = workTimeInput.value * 60;
updateDisplay();