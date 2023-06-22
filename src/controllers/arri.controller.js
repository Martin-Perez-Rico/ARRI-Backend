import { getConnection } from "./../databases/database";
import { cargaDatosCsv,mostrarInstituciones } from "../data/arri.connect.api.js";
import config from "./../config";
import jwt from "jsonwebtoken"; 

const getArri= async (req,res)=>{
    try {
        // Habilitar CORS
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        const connection = await getConnection();
        const result = await connection.query("SELECT id,correo,contraseña FROM usuarios");
        res.status(200).json(result)
    } catch (error) {
        res.status(500).send(error.message);
    }

};

const getUsuario= async (req,res)=>{
    try {
        // Habilitar CORS
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        const {correo,contraseña}=req.body;
        if(correo==undefined || contraseña==undefined){
            res.status(400).json({message:"No se realizo la busqueda"})
        }else{
            const connection = await getConnection();
            const result = await connection.query("SELECT id,nombre,contraseña FROM usuarios WHERE correo = $1",[correo]);
            if(result.rowCount!=0){
                if(result.rows[0]['contraseña']!=contraseña){
                    res.json({message:"Acceso no Permitido"});  
                }else{
                    const token = jwt.sign({id:result.rows[0]['id']},config.secretkey,{
                        expiresIn: 43200 //12 horas
                    });
                    res.status(200).json({token,nombre:result.rows[0]['nombre']})
                }
            }else{
                res.json({message:"Usuario no encontrado"});  
            } 
        }
        
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const addUsuario = async (req,res) =>{
    try {
        // Habilitar CORS
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
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
                    res.status(200).json({token,nombre:result.rows[0]['nombre']})
                }
            }else{
                res.json({message:"Correo ya existente"});  
            }
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const addDatos = async (req,res) =>{
    try {
        // Habilitar CORS
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        const {institucion}=req.body;
        if(institucion==undefined){
            res.status(400).json({message:"Ingrese una institucion"})
        }else{
            cargaDatosCsv(institucion);
            res.status(200).json({message:"Se ha creado el CSV"})
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getInstituciones = async (req,res) =>{
    try {
        // Habilitar CORS
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        const connection = await getConnection();
        const reviso = await connection.query("SELECT nombre FROM instituciones");
        res.status(200).json(reviso.rows)
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const methods = {
    getArri,
    addUsuario,
    getUsuario,
    addDatos,
    getInstituciones
}