import express from 'express';
const router = express.Router();
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getClientsByUser,
} from '../controllers/clients.js';

router
    .route('/')
    .get(getClients)
    .post(createClient);

router.route('/user').get(getClientsByUser);

router
    .route('/:id')
    .put(updateClient)
    .delete(deleteClient);

export const ClientRouter = router;

