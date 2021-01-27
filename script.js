'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class WorkOut {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    constructor(distance, coords, duration) {

        this.distance = distance;
        this.coords = coords;
        this.duration = duration;
    };
}

class Running extends Workout {
    constructor(distance, coords, duration, cadence) {
        super(distance, coords, duration);
        this.cadence = cadence;
        this.calcSpeed();
    }
    calcSpeed() {
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    constructor(distance, coords, duration, elevationGain) {
        super(distance, coords, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
    }
    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

let map;
let loadEvent;
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

    _toggleElevationField() {

        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');

    }

    _newWorkout(e) {

        e.preventDefault();

        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = " ";
        const { lat, lng } = loadEvent.latlng;
        L.marker([lat, lng]).addTo(map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: 'running-popup',
                })
            )
            .setPopupContent(`workout`)
            .openPopup();
    }

}

let newApp = new App();