const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const slider = document.getElementById('measurementSlider');
const sliderLabel = document.getElementById('sliderLabel');
const answerReadout = document.getElementById('answerReadout');
const userGuess = document.getElementById('userGuess');
const statusIndicator = document.getElementById('statusIndicator');
const breakdownText = document.getElementById('breakdownText');
const scoreText = document.getElementById('scoreText');
const historyBody = document.getElementById('historyBody');

let currentMode = 'caliper'; 
let forceReveal = false;
let score = 0;
let currentTaskAnswered = false;

const scale = 15; 

function switchTab(mode) {
    currentMode = mode;
    document.getElementById('tabCaliper').classList.toggle('active', mode === 'caliper');
    document.getElementById('tabMicrometer').classList.toggle('active', mode === 'micrometer');
    
    answerReadout.className = "readout hidden";
    userGuess.value = "";
    forceReveal = false;
    currentTaskAnswered = false;

    if (mode === 'caliper') {
        slider.min = "0";
        slider.max = "30";
        slider.step = "0.05";
        slider.value = "7.45";
    } else {
        slider.min = "0";
        slider.max = "15";
        slider.step = "0.01";
        slider.value = "4.28";
    }
    update();
}

function update() {
    const val = parseFloat(slider.value);
    sliderLabel.innerText = `Adjust Specimen Dimension: ${val.toFixed(2)} mm`;
    
    if (currentMode === 'caliper') {
        const msr = Math.floor(val);
        const vsc = Math.round((val - msr) / 0.05);
        breakdownText.innerHTML = `[TELEMETRY] True Target: ${val.toFixed(2)} mm &bull; MSR = ${msr} mm | Vernier Division Intersect Index = ${vsc}`;
    } else {
        const psr = Math.floor(val * 2) / 2; 
        const csr = Math.round((val - psr) / 0.01);
        breakdownText.innerHTML = `[TELEMETRY] True Target: ${val.toFixed(2)} mm &bull; PSR = ${psr.toFixed(1)} mm | Thimble Division Intersect Index = \Professional`;
    }

    if(!forceReveal && !answerReadout.classList.contains('status-correct') && !answerReadout.classList.contains('status-wrong')){
         answerReadout.classList.add('hidden');
    }

    draw();
}

function generateRandom() {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const step = parseFloat(slider.step);
    const stepsCount = (max - min) / step;
    const randomStep = Math.floor(Math.random() * stepsCount);
    slider.value = (min + randomStep * step).toFixed(2);
    
    answerReadout.className = "readout hidden";
    userGuess.value = "";
    forceReveal = false;
    currentTaskAnswered = false;
    update();
}

function toggleAnswer() {
    forceReveal = !forceReveal;
    if (forceReveal) {
        answerReadout.className = "readout status-correct";
        statusIndicator.innerHTML = "<strong>System Telemetry Overridden (Answer Revealed):</strong>";
    } else {
        answerReadout.className = "readout hidden";
    }
}

function verifyReading() {
    const val = parseFloat(slider.value);
    const guess = parseFloat(userGuess.value);

    if (isNaN(guess)) {
        alert("Error: Please input a numeric verification entry before executing alignment check.");
        return;
    }

    answerReadout.classList.remove('hidden');
    let isCorrect = Math.abs(guess - val) < 0.005;
    let instrumentName = currentMode === 'caliper' ? 'Vernier Caliper' : 'Micrometer';

    if (isCorrect) {
        answerReadout.className = "readout status-correct";
        statusIndicator.innerHTML = "🎯 <strong>Calibration Validated!</strong> Metric values correspond securely.";
        if(!currentTaskAnswered && !forceReveal){
            score++;
            scoreText.innerText = score;
            currentTaskAnswered = true;
        }
    } else {
        answerReadout.className = "readout status-wrong";
        statusIndicator.innerHTML = "⚠️ <strong>Calibration Conflict!</strong> Numerical divergence detected outside system epsilon constraints.";
    }

    let row = document.createElement('tr');
    row.innerHTML = `
        <td>${instrumentName}</td>
        <td>${guess.toFixed(2)}</td>
        <td>${val.toFixed(2)}</td>
        <td class="${isCorrect ? 'text-success' : 'text-danger'}">${isCorrect ? 'PASSED' : 'FAILED'}</td>
    `;
    historyBody.insertBefore(row, historyBody.firstChild);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const val = parseFloat(slider.value);

    if (currentMode === 'caliper') {
        drawCaliper(val);
    } else {
        drawMicrometer(val);
    }
}

function drawCaliper(val) {
    const startX = 120;
    if (val > 0) {
        ctx.fillStyle = "rgba(14, 165, 233, 0.35)";
        ctx.fillRect(startX, 60, val * scale, 60);
    }
    
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(40, 20, 720, 40); 
    ctx.fillRect(startX - 30, 20, 30, 100); 

    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 1;

    for (let i = 0; i <= 45; i++) {
        const x = startX + i * scale;
        let tickHeight = 10;
        if (i % 5 === 0) { tickHeight = 15; ctx.strokeStyle = "#94a3b8"; }
        if (i % 10 === 0) {
            tickHeight = 22;
            ctx.strokeStyle = "#cbd5e1";
            ctx.font = "11px monospace";
            ctx.fillStyle = "#94a3b8";
            ctx.fillText(i, x - 3, 38);
        }
        ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, 60 - tickHeight); ctx.stroke();
    }

    const slideOffset = val * scale;
    const vStart = startX + slideOffset;

    ctx.fillStyle = "#334155";
    ctx.fillRect(vStart, 60, 200, 40); 
    ctx.fillRect(vStart, 60, 30, 60); 

    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#94a3b8";
    
    for (let i = 0; i <= 10; i++) {
        const x = vStart + (i * 0.9 * scale);
        let tickHeight = 10;
        if (i % 5 === 0) {
            tickHeight = 16;
            ctx.font = "10px monospace";
            ctx.fillStyle = "#ffffff";
            ctx.fillText((i * 0.1).toFixed(1), x - 8, 92);
        }
        ctx.beginPath(); ctx.moveTo(x, 60); ctx.lineTo(x, 60 + tickHeight); ctx.stroke();
    }
    
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath(); ctx.moveTo(vStart, 62); ctx.lineTo(vStart - 5, 72); ctx.lineTo(vStart + 5, 72); ctx.fill();
}

function drawMicrometer(val) {
    const originX = 160;
    const uScale = 22; 

    if (val > 0) {
        ctx.fillStyle = "rgba(14, 165, 233, 0.35)";
        ctx.fillRect(originX, 100, val * uScale, 40);
    }

    ctx.fillStyle = "#1e293b"; ctx.fillRect(80, 80, 80, 80); 
    ctx.fillStyle = "#94a3b8"; ctx.fillRect(140, 100, 20, 40); 

    const spindleX = originX + (val * uScale);
    ctx.fillStyle = "#64748b"; ctx.fillRect(spindleX, 100, 150, 40); 

    const sleeveLeft = originX + (15 * uScale);
    ctx.fillStyle = "#cbd5e1"; ctx.fillRect(sleeveLeft, 90, 220, 60); 

    ctx.strokeStyle = "#0f172a"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(sleeveLeft, 120); ctx.lineTo(sleeveLeft + 200, 120); ctx.stroke(); 

    ctx.lineWidth = 1; ctx.fillStyle = "#0f172a";
    for (let i = 0; i <= 15; i++) {
        const tx = sleeveLeft + (i * uScale);
        ctx.beginPath(); ctx.moveTo(tx, 120); ctx.lineTo(tx, 105); ctx.stroke(); 
        ctx.font = "11px monospace"; ctx.fillText(i, tx - 3, 100);

        if (i < 15) {
            ctx.beginPath(); ctx.moveTo(tx + (uScale / 2), 120); ctx.lineTo(tx + (uScale / 2), 132); ctx.stroke(); 
        }
    }

    const thimbleLeft = sleeveLeft + (val * uScale);
    ctx.fillStyle = "#0f172a"; ctx.fillRect(thimbleLeft, 80, 120, 80); 
    ctx.fillStyle = "#475569"; ctx.fillRect(thimbleLeft, 80, 8, 80); 

    ctx.strokeStyle = "#94a3b8"; ctx.fillStyle = "#ffffff";
    const centralValue = (val % 0.5) / 0.01; 
    const intCenter = Math.floor(centralValue);

    for (let offset = -5; offset <= 5; offset++) {
        let lineNum = (intCenter - offset + 50) % 50;
        const targetY = 120 + (offset * 12) - ((centralValue % 1) * 12);
        
        if (targetY > 85 && targetY < 155) {
            ctx.lineWidth = lineNum % 5 === 0 ? 2 : 1;
            ctx.beginPath(); ctx.moveTo(thimbleLeft + 8, targetY); ctx.lineTo(thimbleLeft + 24, targetY); ctx.stroke();
            if (lineNum % 5 === 0) {
                ctx.font = "10px monospace"; ctx.fillText(lineNum, thimbleLeft + 28, targetY + 3);
            }
        }
    }

    ctx.fillStyle = "#38bdf8";
    ctx.beginPath(); ctx.moveTo(thimbleLeft - 5, 120); ctx.lineTo(thimbleLeft - 12, 115); ctx.lineTo(thimbleLeft - 12, 125); ctx.fill();
}

slider.addEventListener('input', update);
update();