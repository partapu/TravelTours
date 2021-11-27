/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: { email, password },
    });
    console.log(res.data.status);
    if (res.data.status === 'Success') {
      window.setTimeout(() => {
        location.assign('/');
        showAlert('success', 'You are logged in');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') {
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
      window.setTimeout(() => {
        location.reload(true);
        showAlert('success', 'You are logged out successfully');
      }, 3000);

      // location.reload(true);
    } //will reload from the server not from the browser cache
  } catch (err) {
    showAlert('error', 'Error while logging out');
  }
};
