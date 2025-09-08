import mongoose from "mongoose";

const certificateSchema = new mongoose.Schema(
  {
    uploadby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentType: {
      type: String,
      required: true,
      // You can also use an enum here if you have specific allowed types, e.g.:
      // enum: ['Type1', 'Type2', 'Type3']
    },
    certificateNumber: {
      type: String,
      required: true,
      // Format must be "CERT-YYYY-XXXXX" (4 digits for year and 5 digits for number)
    },
    issuingAuthority: {
      type: String,
      required: true,
    },
    validityPeriod: {
      start: {
        type: Date,
        required: true,
      },
      end: {
        type: Date,
        required: true,
      },
    },
    uploadDocument: {
      type: String, // This could be a URL or a file path depending on your implementation.
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "disapproved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Certificate = mongoose.model("Certificate", certificateSchema);
export default Certificate;
