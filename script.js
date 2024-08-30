
const timer = document.getElementById('timer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const sessionType = document.getElementById('sessionType');
const sessionCount = document.getElementById('sessionCount');
const subjectSelect = document.getElementById('subjectSelect');
const workTimeInput = document.getElementById('workTime');
const breakTimeInput = document.getElementById('breakTime');
const alarmSound = document.getElementById('alarmSound');
const saveGoalsBtn = document.getElementById('saveGoals');
const goalInputs = document.getElementById('goalInputs');
const achievements = document.getElementById('achievements');

let interval;
let timeLeft;
let isRunning = false;
let isWorkSession = true;
let currentSession = 1;
let stats = JSON.parse(localStorage.getItem('pomodoroStats')) || {};
let goals = JSON.parse(localStorage.getItem('pomodoroGoals')) || {};

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
            timeLeft--;
            updateDisplay();
            if (timeLeft === 0) {
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
    updateDailyChart();
    updateWeeklyChart();
}

function updateDailyChart() {
    const ctx = document.getElementById('dailyChart').getContext('2d');
    const today = new Date().toISOString().split('T')[0];
    const data = stats[today] || {};
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: '오늘의 포모도로 세션',
                data: Object.values(data),
                backgroundColor: ['#FFD700', '#98FB98', '#87CEFA', '#FFA07A']
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    stepSize: 1
                }
            }
        }
    });
}

function updateWeeklyChart() {
    const ctx = document.getElementById('weeklyChart').getContext('2d');
    const today = new Date();
    const lastWeek = new Array(7).fill().map((_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return date.toISOString().split('T')[0];
    }).reverse();
    
    const datasets = ['math', 'science', 'english', 'history'].map((subject, index) => ({
        label: subject,
        data: lastWeek.map(date => (stats[date] && stats[date][subject]) || 0),
        backgroundColor: ['#FFD700', '#98FB98', '#87CEFA', '#FFA07A'][index]
    }));

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: lastWeek,
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    stepSize: 1
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: '주간 포모도로 통계'
                }
            }
        }
    });
}

function createGoalInputs() {
    const subjects = ['math', 'science', 'english', 'history'];
    goalInputs.innerHTML = subjects.map(subject => 
        `<div>
            <label>${subject}: <input type="number" id="goal-${subject}" value="${goals[subject] || 0}" min="0"></label>
        </div>`
    ).join('');
}

function saveGoals() {
    const subjects = ['math', 'science', 'english', 'history'];
    subjects.forEach(subject => {
        goals[subject] = parseInt(document.getElementById(`goal-${subject}`).value) || 0;
    });
    localStorage.setItem('pomodoroGoals', JSON.stringify(goals));
    updateAchievements();
}

function updateAchievements() {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = stats[today] || {};
    
    achievements.innerHTML = Object.entries(goals).map(([subject, goal]) => {
        const achieved = todayStats[subject] || 0;
        const percentage = goal > 0 ? Math.min(100, Math.round((achieved / goal) * 100)) : 0;
        return `
            <div class="achievement">
                <div>${subject}: ${achieved}/${goal}</div>
                <div class="achievement-bar" style="width: ${percentage}%"></div>
            </div>
        `;
    }).join('');
}

startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
saveGoalsBtn.addEventListener('click', saveGoals);

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
createGoalInputs();
updateStats();
updateAchievements();
