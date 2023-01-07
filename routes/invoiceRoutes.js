import express from 'express';
const router = express.Router();
import {
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoice,
    getInvoicesByUser,
    getTotalCount,
  } from '../controllers/invoices.js';

router
    .route('/')
    .get(getInvoicesByUser)
    .post(createInvoice);

router.route('/count').get(getTotalCount); // invoice serial number

router
    .route('/:id')
    .get(getInvoice)
    .put(updateInvoice)
    .delete(deleteInvoice);

export const InvoiceRouter = router;
