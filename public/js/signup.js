import axios from 'axios';
import { showAlert } from './alert';
export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/signup',
      data: { name, email, password, passwordConfirm },
    });
    console.log(res.data.status);
    if (res.data.status === 'Success') {
      window.setTimeout(() => {
        location.assign('/');
        showAlert('success', 'Account is created successfuly');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
