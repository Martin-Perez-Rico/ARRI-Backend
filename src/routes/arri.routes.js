import {Router} from "express";
import { methods as arriController } from "../controllers/arri.controller";
import { verifyToken } from "../middlewares/authJwt";

const app = Router();

app.get("/",arriController.getArri);
app.post("/register",arriController.addUsuario);
app.post("/login",arriController.getUsuario);
app.post("/load",verifyToken,arriController.addDatos);

export default app;