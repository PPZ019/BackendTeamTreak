const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/invoiceController');

router.get('/invoiceSummary', ctrl.getInvoiceSummary);
router.get('/:id', ctrl.getInvoice);
router.get('/', ctrl.getInvoices);
router.post('/', ctrl.createInvoice);
router.put('/:id', ctrl.updateInvoice);
router.delete('/:id', ctrl.deleteInvoice);
router.post('/:id/recordPayment', ctrl.recordPayment);

module.exports = router;
