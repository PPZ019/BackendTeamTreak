const Invoice = require('../models/invoice');

exports.createInvoice = async (req, res) => {
    try {
      const data = req.body;
  
      // Calculate subtotal
      const subtotal = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
      // Calculate tax and discount
      const tax = (subtotal * (data.taxRate || 0)) / 100;
      const totalBeforeDiscount = subtotal + tax;
      const discountAmount = (totalBeforeDiscount * (data.discount || 0)) / 100;
      const total = totalBeforeDiscount - discountAmount;
  
      // Assign calculated values
      data.subtotal = subtotal;
      data.tax = tax;
      data.totalBeforeDiscount = totalBeforeDiscount;
      data.discountAmount = discountAmount;
      data.total = total;
      data.credit = 0;
      data.status = 'pending';
      
      // Include client name in the client object
      data.client = {
        id: data.client, // assuming this is the client ID
        name: data.clientName
      };

      const invoice = new Invoice(data);
      await invoice.save();
  
      res.json({ success: true, result: invoice });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
};
  

exports.getInvoices = async (req, res) => {
    const invoices = await Invoice.find().populate('client.id'); // if using references
    res.json({ success: true, result: invoices });
  };
  
  exports.updateInvoice = async (req, res) => {
    const data = req.body;
    
    // Update client name if provided
    if (data.clientName) {
      data.client = {
        ...data.client,
        name: data.clientName
      };
    }
  
    const inv = await Invoice.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, result: inv });
  };

exports.getInvoice = async (req, res) => {
  const inv = await Invoice.findById(req.params.id);
  if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found' });
  res.json({ success: true, result: inv });
};

exports.updateInvoice = async (req, res) => {
  const inv = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found' });
  res.json({ success: true, result: inv });
};

exports.deleteInvoice = async (req, res) => {
  const inv = await Invoice.findByIdAndDelete(req.params.id);
  if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found' });
  res.json({ success: true, message: 'Invoice deleted' });
};

exports.recordPayment = async (req, res) => {
  const { amount } = req.body;
  const inv = await Invoice.findById(req.params.id);
  if (!inv) return res.status(404).json({ success: false, message: 'Invoice not found' });

  inv.credit = (inv.credit || 0) + amount;
  // update status if fully paid
  if (inv.credit >= inv.total) inv.status = 'paid';
  await inv.save();
  res.json({ success: true, result: inv });
};

