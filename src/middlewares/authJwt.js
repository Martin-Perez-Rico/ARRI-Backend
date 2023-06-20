import jwt from "jsonwebtoken";
import config from "./../config";
import { getConnection } from "./../databases/database";

export const verifyToken = async (req,res,next) => {
    try {
        const connection = await getConnection();
        const token = req.headers["x-access-token"];

        if(!token) return res.status(403).json({message:"No envió el token"})
        const decoded = jwt.verify(token,config.secretkey)

        const reviso = await connection.query("SELECT id FROM usuarios WHERE id = $1",[decoded.id]);
        if(!reviso) return res.status(404).json({message:"Usuario no encontrado"});

        next();
    } catch (error) {
       return res.status(404).json({message:"token no autorizado"}); 
    }  
}