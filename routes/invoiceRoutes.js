const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/invoiceController');

router.post('/', ctrl.createInvoice);
router.get('/', ctrl.getInvoices);
router.get('/:id', ctrl.getInvoice);
router.put('/:id', ctrl.updateInvoice);
router.delete('/:id', ctrl.deleteInvoice);
router.post('/:id/recordPayment', ctrl.recordPayment);

module.exports = router;
