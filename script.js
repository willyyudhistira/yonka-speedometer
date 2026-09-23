let elements = {};
let speedMode = 1;
let indicators = 0;

const onOrOff = state => state ? 'On' : 'Off';

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
        case 1: 
            convertedSpeed = Math.round(speedVal * 2.236936);
            elements.speed.innerText = `${convertedSpeed} MPH`; 
            break; 
        case 2: 
            convertedSpeed = Math.round(speedVal * 1.943844);
            elements.speed.innerText = `${convertedSpeed} Knots`; 
            break; 
        default: 
            convertedSpeed = Math.round(speedVal * 3.6);
            elements.speed.innerText = `${convertedSpeed} KMH`;
    }
}

function setRPM(rpm) {
    elements.rpm.innerText = `${rpm.toFixed(4)} RPM`;
    let rpmBar = document.getElementById('rpm-bar');
    if (rpmBar) {
        rpmBar.style.width = `${Math.max(0, Math.min(100, rpm * 100))}%`;
    }
}

function setFuel(fuel) {
    elements.fuel.innerText = `${(fuel * 100).toFixed(1)}%`;
    let fuelBar = document.getElementById('fuel-bar');
    if (fuelBar) {
        fuelBar.style.width = `${Math.max(0, Math.min(100, fuel * 100))}%`;
    }
}

function setHealth(health) {
    elements.health.innerText = `${(health * 100).toFixed(1)}%`;
    let healthBar = document.getElementById('health-bar');
    if (healthBar) {
        healthBar.style.width = `${Math.max(0, Math.min(100, health * 100))}%`;
    }
}

function setGear(gear) {
    elements.gear.innerText = String(gear);
}

function setHeadlights(state) {
    let lightsText = 'Off';
    let badge = document.getElementById('lights-badge');
    switch(state) {
        case 1: lightsText = 'On'; break;
        case 2: lightsText = 'High Beam'; break;
        default: lightsText = 'Off';
    }
    elements.headlights.innerText = lightsText;
    if (badge) {
        if (state > 0) badge.classList.add('active');
        else badge.classList.remove('active');
    }
}

function setLeftIndicator(state) {
    indicators = (indicators & 0b10) | (state ? 0b01 : 0b00);
    updateIndicatorsDisplay();
}

function setRightIndicator(state) {
    indicators = (indicators & 0b01) | (state ? 0b10 : 0b00);
    updateIndicatorsDisplay();
}

function updateIndicatorsDisplay() {
    let left = indicators & 0b01 ? 'On' : 'Off';
    let right = indicators & 0b10 ? 'On' : 'Off';
    elements.indicators.innerText = `${left} / ${right}`;
}

function setSeatbelts(state) {
    elements.seatbelts.innerText = onOrOff(state);
    let badge = document.getElementById('belt-badge');
    if (badge) {
        if (state) badge.classList.add('active');
        else badge.classList.remove('active');
    }
}

function setSpeedMode(mode) {
    speedMode = mode;
}

function setOdometer(distance) {
    elements.odometer.innerText = distance.toFixed(1) + ' Miles';
}

window.addEventListener('message', (event) => {
    let data = event.data;
    if (data.type === "updateStatus") {
        if (data.show !== undefined) {
            document.body.style.display = data.show ? 'block' : 'none';
        }
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

document.addEventListener('DOMContentLoaded', () => {
    elements = {
        engine: document.getElementById('engine'),
        speed: document.getElementById('speed'),
        rpm: document.getElementById('rpm'),
        fuel: document.getElementById('fuel'),
        health: document.getElementById('health'),
        gear: document.getElementById('gear'),
        headlights: document.getElementById('headlights'),
        indicators: document.getElementById('indicators'),
        seatbelts: document.getElementById('seatbelts'),
        odometer: document.getElementById('odometer'),
    };
});
