import Certificate from "../models/certificate.model.js";
import {
  sendCertificateApprovalEmail,
  sendCertificateDisapprovalEmail,
} from "../services/mailVerficationservice.js";

//Upload Certificate

export const uploadCertificate = async (req, res) => {
  try {
    const uploadBy = req.user.id;
    if (!uploadBy) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let { documentType, certificateNumber, issuingAuthority, validityPeriod } =
      req.body;

    // Handle validityPeriod - can be either a single date or an object with start/end
    let startDate, endDate;

    if (typeof validityPeriod === "string") {
      // If it's a string, treat it as the end date, set start date to now
      startDate = new Date();
      endDate = new Date(validityPeriod);
    } else if (validityPeriod && typeof validityPeriod === "object") {
      // If it's an object, parse start and end dates
      startDate = new Date(validityPeriod.start || Date.now());
      endDate = new Date(validityPeriod.end || validityPeriod);
    } else {
      return res.status(400).json({ message: "Invalid validityPeriod format" });
    }

    if (
      !documentType ||
      !certificateNumber ||
      !issuingAuthority ||
      !validityPeriod
    ) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Remove the strict certificate number validation to allow any format
    // const certNumberRegex = /^CERT-\d{4}-\d{5}$/;
    // if (!certNumberRegex.test(certificateNumber)) {
    //   return res.status(400).json({
    //     message:
    //       "Invalid certificate number format. Expected format is CERT-YYYY-XXXXX",
    //   });
    // }

    //validate validity period
    if (isNaN(startDate) || isNaN(endDate) || startDate >= endDate) {
      return res.status(400).json({ message: "Invalid validity period" });
    }
    //check if file is uploaded
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Please upload the certificate document" });
    }
    const uploadDocument = `uploads/${req.file.filename}`;
    //create new certificate
    const newCertificate = new Certificate({
      uploadby: uploadBy,
      documentType,
      certificateNumber,
      issuingAuthority,
      validityPeriod: { start: startDate, end: endDate },
      uploadDocument,
      status: "pending",
    });
    await newCertificate.save();
    res.status(201).json({
      message: "Certificate uploaded successfully",
      certificate: newCertificate,
    });
  } catch (error) {
    console.log("Error in uploadCertificate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Get all certificates uploaded by the user in paginated form

export const getUserCertificates = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const totalCertificates = await Certificate.countDocuments({
      uploadby: userId,
    });
    const totalPages = Math.ceil(totalCertificates / limit);
    const certificates = await Certificate.find({ uploadby: userId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    res.status(200).json({
      page,
      limit,
      totalPages,
      totalCertificates,
      certificates,
    });
  } catch (error) {
    console.log("Error in getUserCertificates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get all certificates for admin to review with pagination

export const getAllCertificates = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.userType !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status; // Get status filter from query params

    // Build query filter
    const filter = {};
    if (status && status !== "") {
      filter.status = status;
    }

    const totalCertificates = await Certificate.countDocuments(filter);
    const totalPages = Math.ceil(totalCertificates / limit);
    const certificates = await Certificate.find(filter)
      .populate("uploadby", "name email") // Populate user details
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      page,
      limit,
      totalPages,
      totalCertificates,
      certificates,
    });
  } catch (error) {
    console.log("Error in getAllCertificates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//delete certificate by id (only by admin or the user who uploaded it)
export const deleteCertificate = async (req, res) => {
  try {
    const user = req.user;
    const certificateId = req.params.id;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    //only admin or the user who uploaded the certificate can delete it
    if (
      user.userType !== "admin" &&
      certificate.uploadby.toString() !== user.id
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await Certificate.findByIdAndDelete(certificateId);
    res.status(200).json({ message: "Certificate deleted successfully" });
  } catch (error) {
    console.log("Error in deleteCertificate:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//update certificate status (only by admin)
export const updateCertificateStatus = async (req, res) => {
  try {
    const user = req.user;
    const certificateId = req.params.id;
    const { status } = req.body;
    if (!user || user.userType !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (!["pending", "approved", "disapproved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const certificate = await Certificate.findById(certificateId).populate(
      "uploadby",
      "name email"
    );
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Store old status to check if it changed
    const oldStatus = certificate.status;
    certificate.status = status;
    await certificate.save();

    // Send email notification if status changed to approved or disapproved
    if (oldStatus !== status && certificate.uploadby) {
      try {
        if (status === "approved") {
          await sendCertificateApprovalEmail(
            certificate.uploadby.email,
            certificate.uploadby.name,
            certificate.documentType,
            certificate.certificateNumber
          );
        } else if (status === "disapproved") {
          await sendCertificateDisapprovalEmail(
            certificate.uploadby.email,
            certificate.uploadby.name,
            certificate.documentType,
            certificate.certificateNumber
          );
        }
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
        // Don't fail the request if email fails, just log it
      }
    }

    res.status(200).json({
      message: "Certificate status updated successfully",
      certificate,
    });
  } catch (error) {
    console.log("Error in updateCertificateStatus:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//update certificate details (only by the user who uploaded it and only if status is pending)
export const updateCertificateDetails = async (req, res) => {
  try {
    const user = req.user;
    const certificateId = req.params.id;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const certificate = await Certificate.findById(certificateId);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }
    if (certificate.uploadby.toString() !== user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    if (certificate.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending certificates can be updated" });
    }
    let { documentType, certificateNumber, issuingAuthority, validityPeriod } =
      req.body;
    // Parse validityPeriod if sent as a JSON string (form-data)
    if (typeof validityPeriod === "string") {
      try {
        validityPeriod = JSON.parse(validityPeriod);
      } catch {
        return res
          .status(400)
          .json({ message: "Invalid validityPeriod format" });
      }
    }
    if (documentType) certificate.documentType = documentType;
    if (certificateNumber) {
      //validate certificate number format "CERT-YYYY-XXXXX"
      const certNumberRegex = /^CERT-\d{4}-\d{5}$/;
      if (!certNumberRegex.test(certificateNumber)) {
        return res.status(400).json({
          message:
            "Invalid certificate number format. Expected format is CERT-YYYY-XXXXX",
        });
      }
      certificate.certificateNumber = certificateNumber;
    }
    if (issuingAuthority) certificate.issuingAuthority = issuingAuthority;
    if (validityPeriod) {
      //validate validity period
      const startDate = new Date(validityPeriod.start);
      const endDate = new Date(validityPeriod.end);
      if (isNaN(startDate) || isNaN(endDate) || startDate >= endDate) {
        return res.status(400).json({ message: "Invalid validity period" });
      }
      certificate.validityPeriod = { start: startDate, end: endDate };
    }
    //check if file is uploaded
    if (req.file) {
      const uploadDocument = `uploads/${req.file.filename}`;
      certificate.uploadDocument = uploadDocument;
    }
    await certificate.save();
    res.status(200).json({
      message: "Certificate details updated successfully",
      certificate,
    });
  } catch (error) {
    console.log("Error in updateCertificateDetails:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get certificate statistics for admin
export const getCertificateStats = async (req, res) => {
  try {
    const user = req.user;
    if (!user || user.userType !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const totalCertificates = await Certificate.countDocuments();
    const pending = await Certificate.countDocuments({ status: "pending" });
    const approved = await Certificate.countDocuments({ status: "approved" });
    const disapproved = await Certificate.countDocuments({
      status: "disapproved",
    });

    res.status(200).json({
      totalCertificates,
      byStatus: {
        pending,
        approved,
        disapproved,
      },
    });
  } catch (error) {
    console.log("Error in getCertificateStats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
