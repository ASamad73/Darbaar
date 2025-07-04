import express from "express";
import cors from "cors";
import authRoute from './routes/authRoute.js';
import updateRoute from './routes/updateRoutes.js'

export const app = express();

app.use(cors({
  origin: "https://darbaar.netlify.app", 
}));
app.use(express.json());

app.use("/", authRoute);
app.use("/", updateRoute)


