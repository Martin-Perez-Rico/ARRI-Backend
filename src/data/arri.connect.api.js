import axios from 'axios';
const fs = require('fs');

const getApi = async (institucion) => {
    const insti = "'"+institucion+"'";
    const url = "https://www.datos.gov.co/resource/kgxf-xxbe.json?$query=SELECT periodo,cole_nombre_establecimiento,estu_genero,desemp_ingles,punt_ingles,punt_matematicas,punt_sociales_ciudadanas,punt_c_naturales,punt_lectura_critica,punt_global WHERE punt_ingles IS NOT NULL AND punt_matematicas IS NOT NULL AND punt_sociales_ciudadanas IS NOT NULL AND punt_c_naturales IS NOT NULL AND punt_lectura_critica IS NOT NULL AND punt_global IS NOT NULL AND cole_nombre_establecimiento = "+insti;
    const response = await axios.get(url);
    return response.data;
}

const getIns = async (institucion) => {
    const convCSV = createCsv({
        path:"./csv/"+institucion+".csv",
        header:['periodo','cole_nombre_establecimiento','estu_genero','desemp_ingles','punt_ingles','punt_matematicas','punt_sociales_ciudadanas','punt_c_naturales','punt_lectura_critica','punt_global'].map((item) => ({ id: item, title: item }))
    });
    return convCSV;
}

const cargaDatosCsv= async (institucion)=>{
    const data = await getApi(institucion);
    const file_data = await JSON.stringify(data);
    const parsed_data = await JSON.parse(file_data);

    try {
        const puntero = await getIns(institucion); 
        await puntero.writeRecords(parsed_data);
        return data;
    } catch (error) {
        console.log(error);
    }
}

const getNotasArea = async (jsonData) => {
    var estudiantes = 0;
    var promedioIngles = 0;
    var promedioMatematicas = 0;
    var promedioSociales = 0;
    var promedioNaturales = 0;
    var promedioLectura = 0;
    var promedioGlobal = 0;

    for (let key in jsonData) {
        promedioIngles+=parseInt(jsonData[key].punt_ingles);
        promedioMatematicas+=parseInt(jsonData[key].punt_matematicas);
        promedioSociales+=parseInt(jsonData[key].punt_sociales_ciudadanas);
        promedioNaturales+=parseInt(jsonData[key].punt_c_naturales);
        promedioLectura+=parseInt(jsonData[key].punt_lectura_critica);
        promedioGlobal+=parseInt(jsonData[key].punt_global);
        estudiantes++;
    }

    promedioIngles/=estudiantes
    promedioMatematicas/=estudiantes
    promedioSociales/=estudiantes
    promedioNaturales/=estudiantes
    promedioLectura/=estudiantes
    promedioGlobal/=estudiantes

    const datos = {
        "Ingles":promedioIngles,
        "Matematicas":promedioMatematicas,
        "Sociales":promedioSociales,
        "Naturales":promedioNaturales,
        "Lectura":promedioLectura,
        "Global":promedioGlobal
    };

    return datos;
}

const getNotasPeriodo = async (jsonData) => {
    let periodos = [];
    let promedios = [];
    let estudiantes = [];
    let enviar = [];

    for (let key in jsonData) {
        var repetido = false
        for (let i = 0; i < periodos.length; i++) {
            if(jsonData[key].periodo==periodos[i]){
                repetido=true;
                break;
            }
        }
        if(!repetido){
            periodos.push(jsonData[key].periodo);
        }
    }

    periodos.sort();

    for (let i in periodos) {
        promedios.push([0,0,0,0,0,0]);
        estudiantes.push(0);
    }


    for (let key in jsonData) {
        for (let i in periodos) {
            if(periodos[i]==jsonData[key].periodo){
                promedios[i][0]+=parseInt(jsonData[key].punt_ingles);
                promedios[i][1]+=parseInt(jsonData[key].punt_matematicas);
                promedios[i][2]+=parseInt(jsonData[key].punt_sociales_ciudadanas);
                promedios[i][3]+=parseInt(jsonData[key].punt_c_naturales);
                promedios[i][4]+=parseInt(jsonData[key].punt_lectura_critica);
                promedios[i][5]+=parseInt(jsonData[key].punt_global);
                estudiantes[i]++;
            }
        }
    }

    for (let i = 0; i < periodos.length; i++) {

        const datos = {
            "Periodo": periodos[i],
            "Ingles": promedios[i][0]/estudiantes[i],
            "Matematicas": promedios[i][1]/estudiantes[i],
            "Sociales": promedios[i][2]/estudiantes[i],
            "Naturales": promedios[i][3]/estudiantes[i],
            "Lectura": promedios[i][4]/estudiantes[i],
            "Global": promedios[i][5]/estudiantes[i]
        }
        enviar.push(datos);
    }

    return enviar;
}

const cargarEstadisticas= async (institucion)=>{
    const data = await getApi(institucion);
    const file_data1 = await getNotasArea(data);
    const file_data2 = await getNotasPeriodo(data);
    const json = {
        "PromedioAreas":file_data1,
        "PromedioPeriodos":file_data2,
    };
    const jsonData = JSON.stringify(json, null, 2);
    const rutaArchivo = "./estadisticas/"+institucion+".json";

    try {
        fs.writeFile(rutaArchivo, jsonData, (err) => {
            if (err) {
              console.error('Error al crear el archivo JSON:', err);
            } else {
              console.log('Archivo JSON creado exitosamente.');
            }
        });
    } catch (error) {
        console.log(error);
    }
    return data;
}

const enviarEstadisticas= async (institucion)=>{
    const rutaArchivo = "./estadisticas/"+institucion+".json";
    const datos = fs.readFileSync(rutaArchivo);
    return JSON.parse(datos);
}

export { cargarEstadisticas,enviarEstadisticas };