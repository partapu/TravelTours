/* eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51JyvVeSElnEHZ9ucBHxzRwUAn2utnywA97e4xChRH6KYW659I8ZCPBcFtxHuji892qL9pjfEcq5pfVRTHwcZXYzG00UVM5QQ3L'
);

export const bookTour = async (tourId) => {
  try {
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
