const ITDeclaration = require("../models/ITDeclaration");

exports.submitDeclaration = async (req, res) => {
  const { licAmount, healthInsurance, hra, lta } = req.body;

  try {
    const declaration = await ITDeclaration.create({
      empId: req.user._id,
      licAmount,
      healthInsurance,
      hra,
      lta,
    });

    res.status(201).json({ success: true, message: "Declaration submitted", data: declaration });
  } catch (err) {
    res.status(500).json({ success: false, message: "Error submitting declaration" });
  }
};

exports.getMyDeclarations = async (req, res) => {
  try {
    const data = await ITDeclaration.find({ empId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.getAllDeclarations = async (req, res) => {
    try {
      const isClient = req.user.type === "client"; // role or type depending on your model
  
      const allDeclarations = await ITDeclaration.find()
        .populate({
          path: "empId",
          select: "name username email company", // include company field
        })
        .sort({ createdAt: -1 });
  
      const filteredDeclarations = isClient
        ? allDeclarations.filter(
            (dec) =>
              dec.empId?.company?.toString() === req.user.company?.toString()
          )
        : allDeclarations;
  
      res.json({ success: true, data: filteredDeclarations });
    } catch (err) {
      console.error("getAllDeclarations error:", err);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
  

exports.approveDeclaration = async (req, res) => {
  try {
    const declaration = await ITDeclaration.findByIdAndUpdate(
      req.params.id,
      { status: "approved", remark: req.body.remark || "" },
      { new: true }
    );
    res.json({ success: true, message: "Approved", data: declaration });
  } catch {
    res.status(500).json({ success: false });
  }
};

exports.rejectDeclaration = async (req, res) => {
  try {
    const declaration = await ITDeclaration.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", remark: req.body.remark || "" },
      { new: true }
    );
    res.json({ success: true, message: "Rejected", data: declaration });
  } catch {
    res.status(500).json({ success: false });
  }
};
