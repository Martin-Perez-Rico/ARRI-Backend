import { getConnection } from "./../databases/database";
import { cargarEstadisticas,enviarEstadisticas } from "../data/arri.connect.api.js";
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
                    const idToken = await connection.query("SELECT id,nombre FROM usuarios WHERE correo = $1",[correo]);
                    const token = jwt.sign({id:idToken.rows[0]['id']},config.secretkey,{
                        expiresIn: 43200 //12 horas
                    });
                    res.status(200).json({token,nombre:idToken.rows[0]['nombre']})
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
    const currentDate = new Date();
    try {
        // Habilitar CORS
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        const {institucion} = req.body;
        const token = req.headers["x-access-token"];
        const decoded = jwt.verify(token,config.secretkey)
        if(institucion==undefined){
            res.status(400).json({message:"Ingrese una institucion"})
        }else{
            const datos = [institucion,currentDate.getFullYear(),decoded.id]
            const connection = await getConnection();
            const reviso = await connection.query("SELECT año_creacion FROM datos_institucion WHERE nombre_institucion = $1 AND id_usuario = $2",[datos[0],datos[2]]);
            if(reviso.rowCount==0){
                const result = await connection.query("INSERT INTO datos_institucion (nombre_institucion,año_creacion,id_usuario) VALUES ($1,$2,$3)",datos);
                if(result.rowCount==0){
                    res.json({message:"No se ha encontrado la informacion de la institucion"});  
                }else{
                    const info = await cargarEstadisticas(institucion);
                    res.status(200).json(info)
                }
            }else{
                const result = await connection.query("UPDATE datos_institucion SET año_creacion = $1",[datos[1]]);
                if(result.rowCount==0){
                    res.json({message:"No se ha actualizado la informacion de la institucion"});  
                }else{
                    const info = await cargarEstadisticas(institucion);
                    res.status(200).json(info)
                }
            }
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
        const result = await connection.query("SELECT nombre FROM instituciones");
        res.status(200).json(result.rows)
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getInstiUser = async (req,res) =>{
    try {
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        const token = req.headers["x-access-token"];
        const decoded = jwt.verify(token,config.secretkey)
        const connection = await getConnection();
        const result = await connection.query("SELECT nombre_institucion FROM datos_institucion WHERE id_usuario = $1",[decoded.id]);
        res.status(200).json(result.rows)
    } catch (error) {
        res.status(500).send(error.message);
    }
};

const getEstadisticas = async (req,res) =>{
    try {
        // Habilitar CORS
        res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
        const {institucion} = req.body;
        if(institucion==undefined){
            res.status(400).json({message:"Ingrese una institucion"})
        }else{
            try {
                const estadisticas = await enviarEstadisticas(institucion);
                res.status(200).json(estadisticas);
            } catch (error) {
                res.status(500).send(error.message);
            }
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const methods = {
    getArri,
    addUsuario,
    getUsuario,
    addDatos,
    getInstituciones,
    getInstiUser,
    getEstadisticas
}