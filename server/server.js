const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./config/DB");
const authroute = require("./routes/authRoutes");
dotenv.config();
const app = express();

app.use(express.json());


app.use("/api/auth",authroute);

const PORT = process.env.PORT || 5000;

connectDb().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port :${PORT}`);
    });
});