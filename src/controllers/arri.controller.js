import { getConnection } from "./../databases/database";
import config from "./../config";
import jwt from "jsonwebtoken";

const getArri= async (req,res)=>{
    try {
        const connection = await getConnection();
        const result = await connection.query("SELECT id,correo,contraseña FROM usuarios");
        res.status(200).json(result)
    } catch (error) {
        res.status(500);
    }

};

const getUsuario= async (req,res)=>{
    try {
        const {correo,contraseña}=req.body;
        if(correo==undefined || contraseña==undefined){
            res.status(400).json({message:"No se realizo la busqueda"})
        }else{
            const connection = await getConnection();
            const result = await connection.query("SELECT id,contraseña FROM usuarios WHERE correo = $1",[correo]);
            if(result.rowCount!=0){
                if(result.rows[0]['contraseña']!=contraseña){
                    res.json({message:"Acceso no Permitido"});  
                }else{
                    const token = jwt.sign({id:result.rows[0]['id']},config.secretkey,{
                        expiresIn: 43200 //12 horas
                    });
                    res.status(200).json({token})
                }
            }else{
                res.json({message:"Usuario no encontrado"});  
            } 
        }
        
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const addUsuario = async (req,res) =>{
    try {
        const {nombre,correo,contraseña}=req.body;
        if(nombre==undefined || correo==undefined || contraseña==undefined){
            res.status(400).json({message:"No se realizo la insersion"})
        }else{
            const usuario=[nombre,correo,contraseña];
            const connection = await getConnection();
            const reviso = await connection.query("SELECT correo FROM usuarios WHERE correo = $1",[correo]);
            if(reviso.rowCount==0){
                const result = await connection.query("INSERT INTO usuarios (nombre,correo,contraseña) VALUES ($1,$2,$3)",usuario);
                if(result.rowCount==0){
                    res.json({message:"No se ha podido registrar el usuario"});  
                }else{
                    const idToken = await connection.query("SELECT id FROM usuarios WHERE correo = $1",[correo]);
                    const token = jwt.sign({id:idToken.rows[0]['id']},config.secretkey,{
                        expiresIn: 43200 //12 horas
                    });
                    res.status(200).json({token})
                }
            }else{
                res.json({message:"Correo ya existente"});  
            }
        }
    } catch (error) {
        res.status(500);
        res.send(error.message);
    }
};

const verifyToken = async (req,res,next) => {
    try {
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

export const methods = {
    getArri,
    addUsuario,
    getUsuario
}