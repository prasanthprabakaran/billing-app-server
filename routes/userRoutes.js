import express from "express";
const router = express.Router();
import {
    signin,
    signup,
    forgotPassword,
    resetPassword,
  } from '../controllers/user.js';

  router.route('/signin').post(signin);

  router.route('/signup').post(signup);

  router.route('/forgot').post(forgotPassword);

  router.route('/reset').post(resetPassword);

  export const userRouter = router;
