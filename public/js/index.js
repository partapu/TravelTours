/* eslint-disable*/

import '@babel/polyfill';
import { login, logout } from './login';
import { displayMap } from './mapbox';
import { updateMyData, updateMyPassword } from './updateSettings';
import { signup } from './signup';
import { bookTour } from './stripe';
import axios from 'axios';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const saveSettings = document.querySelector('.btn--small');
const passwordChange = document.querySelector('.btn--password');
const signupForm = document.querySelector('.form--Signup');
const tourBookBtn = document.getElementById('book-tour');

let locations, email, password;
if (mapBox) {
  locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    email = document.getElementById('email').value;
    password = document.getElementById('password').value;
    e.preventDefault();
    console.log(email, password);
    login(email, password);
  });
}
if (logoutBtn) logoutBtn.addEventListener('click', logout);
if (saveSettings) {
  saveSettings.addEventListener('click', async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    saveSettings.textContent = 'Updating...';
    await updateMyData(form);
    saveSettings.textContent = 'Save Settings';
  });
}

if (passwordChange) {
  passwordChange.addEventListener('click', async (e) => {
    e.preventDefault();
    passwordChange.textContent = 'Updating...';
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    await updateMyPassword(passwordCurrent, password, passwordConfirm);
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
    passwordChange.textContent = 'Save Password';
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    e.textContent = 'Logging In...';
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('retypepassword').value;
    signup(name, email, password, passwordConfirm);
  });
}
if (tourBookBtn) {
  tourBookBtn.addEventListener('click', (e) => {
    tourBookBtn.textContent = 'Processing...';

    bookTour(tourBookBtn.dataset.tourId);
    tourBookBtn.textContent = 'Book Tour Now!';
  });
}
