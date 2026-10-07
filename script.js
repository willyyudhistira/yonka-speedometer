let elements = {};
let speedMode = 1;
let indicators = 0;
const onOrOff = state => state ? 'On' : 'Off';

// --- LOGIKA UPDATE DATA SPEEDOMETER ---
function setEngine(state) {
    elements.engine.innerText = onOrOff(state);
    let badge = document.getElementById('engine-badge');
    if (badge) {
        if (state) badge.classList.add('active');
        else badge.classList.remove('active');
    }
}
function setSpeed(speedVal) {
    let convertedSpeed = 0;
    switch(speedMode) {
        case 1: convertedSpeed = Math.round(speedVal * 2.236936); elements.speed.innerText = `${convertedSpeed} MPH`; break; 
        case 2: convertedSpeed = Math.round(speedVal * 1.943844); elements.speed.innerText = `${convertedSpeed} Knots`; break; 
        default: convertedSpeed = Math.round(speedVal * 3.6); elements.speed.innerText = `${convertedSpeed} KMH`;
    }
}
function setRPM(rpm) {
    elements.rpm.innerText = `${rpm.toFixed(4)} RPM`;
    let rpmBar = document.getElementById('rpm-bar');
    if (rpmBar) rpmBar.style.width = `${Math.max(0, Math.min(100, rpm * 100))}%`;
}
function setFuel(fuel) {
    elements.fuel.innerText = `${(fuel * 100).toFixed(1)}%`;
    let fuelBar = document.getElementById('fuel-bar');
    if (fuelBar) fuelBar.style.width = `${Math.max(0, Math.min(100, fuel * 100))}%`;
}
function setHealth(health) {
    elements.health.innerText = `${(health * 100).toFixed(1)}%`;
    let healthBar = document.getElementById('health-bar');
    if (healthBar) healthBar.style.width = `${Math.max(0, Math.min(100, health * 100))}%`;
}
function setGear(gear) { elements.gear.innerText = String(gear); }
function setHeadlights(state) {
    let lightsText = 'Off';
    let badge = document.getElementById('lights-badge');
    switch(state) { case 1: lightsText = 'On'; break; case 2: lightsText = 'High Beam'; break; default: lightsText = 'Off'; }
    elements.headlights.innerText = lightsText;
    if (badge) { if (state > 0) badge.classList.add('active'); else badge.classList.remove('active'); }
}
function setLeftIndicator(state) { indicators = (indicators & 0b10) | (state ? 0b01 : 0b00); updateIndicatorsDisplay(); }
function setRightIndicator(state) { indicators = (indicators & 0b01) | (state ? 0b10 : 0b00); updateIndicatorsDisplay(); }
function updateIndicatorsDisplay() {
    elements.indicators.innerText = `${indicators & 0b01 ? 'On' : 'Off'} / ${indicators & 0b10 ? 'On' : 'Off'}`;
}
function setSeatbelts(state) {
    elements.seatbelts.innerText = onOrOff(state);
    let badge = document.getElementById('belt-badge');
    if (badge) { if (state) badge.classList.add('active'); else badge.classList.remove('active'); }
}
function setSpeedMode(mode) { speedMode = mode; }
function setOdometer(distance) { elements.odometer.innerText = distance.toFixed(1) + ' Miles'; }

// --- NUI MESSAGE LISTENER ---
window.addEventListener('message', (event) => {
    let data = event.data;
    if (data.type === "updateStatus") {
        if (data.show !== undefined) document.body.style.display = data.show ? 'block' : 'none';
        if (data.engine !== undefined) setEngine(data.engine);
        if (data.speed !== undefined) setSpeed(data.speed);
        if (data.rpm !== undefined) setRPM(data.rpm);
        if (data.fuel !== undefined) setFuel(data.fuel);
        if (data.health !== undefined) setHealth(data.health);
        if (data.gear !== undefined) setGear(data.gear);
        if (data.headlights !== undefined) setHeadlights(data.headlights);
        if (data.leftIndicator !== undefined) setLeftIndicator(data.leftIndicator);
        if (data.rightIndicator !== undefined) setRightIndicator(data.rightIndicator);
        if (data.seatbelts !== undefined) setSeatbelts(data.seatbelts);
        if (data.odometer !== undefined) setOdometer(data.odometer);
    }
});

// --- LOGIKA DRAG, UKURAN, DAN SETTINGS ---
document.addEventListener('DOMContentLoaded', () => {
    elements = {
        engine: document.getElementById('engine'), speed: document.getElementById('speed'),
        rpm: document.getElementById('rpm'), fuel: document.getElementById('fuel'),
        health: document.getElementById('health'), gear: document.getElementById('gear'),
        headlights: document.getElementById('headlights'), indicators: document.getElementById('indicators'),
        seatbelts: document.getElementById('seatbelts'), odometer: document.getElementById('odometer')
    };

    const wrapper = document.getElementById('speedo-wrapper');
    const speedoContent = document.getElementById('speedo-content');
    const trigger = document.getElementById('settings-trigger');
    const closeBtn = document.getElementById('close-settings');
    const scaleRange = document.getElementById('scale-range');
    const scaleText = document.getElementById('scale-text');
    const resetPosBtn = document.getElementById('reset-pos');

    // 1. Muat Posisi & Ukuran dari Penyimpanan (Local Storage)
    const savedScale = localStorage.getItem('speedo_scale');
    if (savedScale) {
        speedoContent.style.transform = `scale(${savedScale})`;
        scaleRange.value = Math.round(savedScale * 100);
        scaleText.innerText = `${Math.round(savedScale * 100)}%`;
    }

    const savedLeft = localStorage.getItem('speedo_left');
    const savedTop = localStorage.getItem('speedo_top');
    if (savedLeft && savedTop) {
        wrapper.style.right = 'auto';
        wrapper.style.bottom = 'auto';
        wrapper.style.left = savedLeft;
        wrapper.style.top = savedTop;
    }

    // 2. Tampilkan/Sembunyikan Panel Settings
    trigger.addEventListener('click', () => wrapper.classList.add('setting-mode'));
    closeBtn.addEventListener('click', () => wrapper.classList.remove('setting-mode'));

    // 3. Ubah Ukuran (Scale) Real-time
    scaleRange.addEventListener('input', (e) => {
        const val = e.target.value;
        const scaleValue = val / 100;
        scaleText.innerText = `${val}%`;
        speedoContent.style.transform = `scale(${scaleValue})`;
        localStorage.setItem('speedo_scale', scaleValue);
    });

    // 4. Reset Posisi ke Default (Pojok Kanan Bawah)
    resetPosBtn.addEventListener('click', () => {
        wrapper.style.left = 'auto';
        wrapper.style.top = 'auto';
        wrapper.style.right = '25px';
        wrapper.style.bottom = '25px';
        localStorage.removeItem('speedo_left');
        localStorage.removeItem('speedo_top');
    });

    // 5. Logika DRAG & DROP (Menggeser Speedo)
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    wrapper.addEventListener('mousedown', (e) => {
        // Jangan geser jika klik area setting panel atau trigger button
        if (e.target.closest('#settings-panel') || e.target.closest('#settings-trigger')) return;
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const rect = wrapper.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        // Ubah dari bottom/right ke koordinat absolute (left/top)
        wrapper.style.right = 'auto';
        wrapper.style.bottom = 'auto';
        wrapper.style.left = `${initialLeft}px`;
        wrapper.style.top = `${initialTop}px`;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        wrapper.style.left = `${initialLeft + dx}px`;
        wrapper.style.top = `${initialTop + dy}px`;
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            // Simpan posisi terakhir ke Local Storage
            localStorage.setItem('speedo_left', wrapper.style.left);
            localStorage.setItem('speedo_top', wrapper.style.top);
        }
    });
});
