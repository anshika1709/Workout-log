'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    constructor(distance, coords, duration) {

        this.distance = distance;
        this.coords = coords;
        this.duration = duration;


    };
    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
    }

}
class Running extends Workout {
    constructor(distance, coords, duration, cadence, type) {
        super(distance, coords, duration);
        this.cadence = cadence;
        this.type = type;
        this.calcSpeed();
        this._setDescription();
    }
    calcSpeed() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    constructor(distance, coords, duration, elevationGain, type) {
        super(distance, coords, duration);
        this.elevationGain = elevationGain;
        this.type = type;
        this.calcSpeed();
        this._setDescription();
    }
    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

let map;
let loadEvent;
let workOut;
let workOuts = [];
class App {


    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
    };

    _getPosition() {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), () => { alert("Couldn't load your location") });
    }

    _loadMap(position) { //My location
        const { latitude, longitude } = position.coords;

        //For Leaflet Library
        map = L.map('map').setView([latitude, longitude], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);


        //click event
        map.on('click', this._showForm.bind(this));
    }

    _showForm(mapEvent) {
        loadEvent = mapEvent;
        form.classList.remove('hidden');
        inputDistance.focus();
    }


    _hideForm() {
        // Empty inputs
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
            '';

        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => (form.style.display = 'grid'), 1000);
    }

    _toggleElevationField() {

        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');

    }

    _newWorkout(e) {


        const validInputs = (...inputs) =>
            inputs.every(input => Number.isFinite(input))

        const allPositive = (...inputs) =>
            inputs.every(input => input > 0)

        //Handling inputs from the form
        const type = inputType.value;

        //converting the below two to numbers
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = loadEvent.latlng;
        let workOut;


        e.preventDefault();

        if (type === 'running') {
            const cadence = +inputCadence.value;


            if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence))
                return alert('Invalid inputs');
            workOut = new Running(distance, [lat, lng], duration, cadence, type);

        }


        if (type === 'cycling') {
            const elevation = +inputElevation.value;

            if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration))
                return alert('Invalid inputs');
            workOut = new Cycling(distance, [lat, lng], duration, elevation, type);

        }

        workOuts.push(workOut)
        console.log(workOut);
        this._renderWorkoutMarker(workOut);
        this._renderWorkout(workOut);
        this._hideForm();
    }

    _renderWorkoutMarker(workOut) {
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = " ";
        L.marker(workOut.coords).addTo(map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workOut.type}-popup`,
                })
            )
            .setPopupContent(`workout`)
            .openPopup();
    }
    _renderWorkout(workOut) {
        let html = `
              <li class="workout workout--${workOut.type}" data-id="${workOut.id}">
                <h2 class="workout__title">${workOut.description}</h2>
                <div class="workout__details">
                  <span class="workout__icon">${
                    workOut.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
                  }</span>
                  <span class="workout__value">${workOut.distance}</span>
                  <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                  <span class="workout__icon">⏱</span>
                  <span class="workout__value">${workOut.duration}</span>
                  <span class="workout__unit">min</span>
                </div>
            `;

        if (workOut.type === 'running')
            html += `
                <div class="workout__details">
                  <span class="workout__icon">⚡️</span>
                  <span class="workout__value">${workOut.pace.toFixed(1)}</span>
                  <span class="workout__unit">min/km</span>
                </div>
                <div class="workout__details">
                  <span class="workout__icon">🦶🏼</span>
                  <span class="workout__value">${workOut.cadence}</span>
                  <span class="workout__unit">spm</span>
                </div>
              </li>
              `;

        if (workOut.type === 'cycling')
            html += `
                <div class="workout__details">
                  <span class="workout__icon">⚡️</span>
                  <span class="workout__value">${workOut.speed.toFixed(1)}</span>
                  <span class="workout__unit">km/h</span>
                </div>
                <div class="workout__details">
                  <span class="workout__icon">⛰</span>
                  <span class="workout__value">${workOut.elevationGain}</span>
                  <span class="workout__unit">m</span>
                </div>
              </li>
              `;

        form.insertAdjacentHTML('afterend', html);
    }


}

let newApp = new App();