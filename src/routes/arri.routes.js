import {Router} from "express";
import { methods as arriController } from "../controllers/arri.controller";
const jwt = require("jsonwebtoken");

const app = Router();

app.get("/",arriController.getArri);
app.post("/register",arriController.addUsuario);
app.post("/login",arriController.getUsuario);

export default app;