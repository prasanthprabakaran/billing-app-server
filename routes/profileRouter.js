import express from 'express';
const router = express.Router();
import {
    createProfile,
    updateProfile,
    deleteProfile,
    getProfile,
    getProfilesByUser,
  } from '../controllers/profile.js';

router
    .route('/')
    .get(getProfilesByUser)
    .post(createProfile);


router
    .route('/:id')
    .get(getProfile)
    .put(updateProfile)
    .delete(deleteProfile);

export const ProfileRouter = router;
