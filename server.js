import express from "express";

//db connection
import connectDB from "./db/db.js";

//import routes
import userRoutes from "./routes/user.route.js";
import listingRoutes from "./routes/listing.route.js";
import certificateRoutes from "./routes/certificate.route.js";


const app = express();
const PORT = process.env.PORT || 3000;

//middleware
import cookieParser from "cookie-parser";
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//routes
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/certificates", certificateRoutes);
app.get("/", (req, res) => {
  res.send("Hello From Rebot Backend");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});
