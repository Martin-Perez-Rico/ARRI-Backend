import express from "express";
import morgan from "morgan";
import cors from 'cors';
//Routes
import arriRoutes from "./routes/arri.routes"

const app=express();

// Settings CORS
const corsOptions = {
    origin: 'http://localhost:3000',
  };
  
  app.use(cors(corsOptions));
  
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "x-access-token, Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
});

// Settings
app.set("port",4000);

// Middlewares
app.use(morgan("dev"));
app.use(express.json());

//Routes
app.use("/api/arri",arriRoutes);

export default app;