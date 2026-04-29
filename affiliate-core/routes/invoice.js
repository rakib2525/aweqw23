const express = require("express");
const router = express.Router();

const Invoice = require("../models/Invoice");
const User = require("../models/User");

const auth = require("../middleware/auth");
const role = require("../middleware/role");

// 🔥 PDF GENERATOR
const generateInvoicePDF = require("../utils/invoicePdf");


// =========================
// 🔥 GET MY INVOICES
// =========================
router.get("/my", auth, async (req, res) => {
  try {
    const data = await Invoice.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (err) {
    console.error("GET INVOICE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// =========================
// 🔥 ADMIN: ALL INVOICES
// =========================
router.get("/", auth, role("admin"), async (req, res) => {
  try {
    const data = await Invoice.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      data
    });

  } catch (err) {
    console.error("GET ALL INVOICES ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// =========================
// 🔥 DOWNLOAD PDF
// =========================
router.get("/:id/pdf", auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    // 🔒 SECURITY
    if (
      req.user.role !== "admin" &&
      invoice.userId.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    const user = await User.findById(invoice.userId);

    const doc = generateInvoicePDF(invoice, user);

    // 🔥 HEADERS
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${invoice.invoiceId || invoice._id}.pdf`
    );

    doc.pipe(res);
    doc.end();

  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({
      success: false,
      message: "PDF generation failed"
    });
  }
});


// =========================
// 🔥 GET SINGLE INVOICE
// =========================
router.get("/:id", auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("userId", "name email");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found"
      });
    }

    // 🔒 SECURITY
    if (
      req.user.role !== "admin" &&
      invoice.userId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    res.json({
      success: true,
      data: invoice
    });

  } catch (err) {
    console.error("GET SINGLE INVOICE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

module.exports = router;