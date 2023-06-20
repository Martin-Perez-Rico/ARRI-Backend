import express from "express";
import morgan from "morgan";
//Routes
import arriRoutes from "./routes/arri.routes"

const app=express();

// Settings
app.set("port",3000);

// Middlewares
app.use(morgan("dev"));
app.use(express.json());

//Routes
app.use("/api/arri",arriRoutes);

export default app;