require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

const app = express();
const port = process.env.PORT || 5000;
const authRoute = require("./routes/authRoute");
const userRoute = require("./routes/userRoute")
const postRoute = require("./routes/postRoute")

connectDB();

app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/post", postRoute);

app.listen(port, () => {
    console.log(`Server connected to port ${port} successfully`);
});
