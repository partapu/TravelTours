/* eslint-disable */

import { showAlert } from './alert';
import axios from 'axios';

export const updateMyData = async (data) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMe',
      data,
    });

    if (res.data.status === 'success') {
      window.setTimeout(() => {
        location.reload(true);
        showAlert('success', 'Data updated successfuly!');
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};

export const updateMyPassword = async (
  passwordCurrent,
  password,
  passwordConfirm
) => {
  try {
    console.log('Event');
    console.log(passwordCurrent, password, passwordConfirm);
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updatePassword',
      data: { passwordCurrent, password, passwordConfirm },
    });
    console.log(res.data.status);
    if (res.data.status === 'Success') {
      window.setTimeout(() => {
        location.reload(true);
        showAlert('success', 'Password Changed Sucessfuly!');
      }, 1500);
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err.response.data.message);
  }
};
