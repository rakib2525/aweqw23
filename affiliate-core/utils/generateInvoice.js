const Invoice = require("../models/Invoice");

const generateInvoiceId = () => {
  return "INV-" + Date.now();
};

const generateInvoice = async ({ user, withdraw }) => {

  // 🔥 MINIMUM CHECK
  if (withdraw.amount < 50) return null;

  const invoice = await Invoice.create({
    invoiceId: generateInvoiceId(),
    userId: user._id,
    withdrawId: withdraw._id,
    amount: withdraw.amount,
    method: withdraw.method,
    account: withdraw.account,
    period: "daily", // 🔥 can be dynamic later
    periodStart: new Date(),
    periodEnd: new Date()
  });

  return invoice;
};

module.exports = generateInvoice;