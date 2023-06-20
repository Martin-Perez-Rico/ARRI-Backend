import axios from 'axios';
import { createObjectCsvWriter as createCsv } from 'csv-writer';

const getApi = async () => {
    const url = 'https://www.datos.gov.co/resource/kgxf-xxbe.json?$query=SELECT periodo,cole_nombre_establecimiento,estu_genero,desemp_ingles,punt_ingles,punt_matematicas,punt_sociales_ciudadanas,punt_c_naturales,punt_lectura_critica,punt_global WHERE punt_ingles IS NOT NULL AND punt_matematicas IS NOT NULL AND punt_sociales_ciudadanas IS NOT NULL AND punt_c_naturales IS NOT NULL AND punt_lectura_critica IS NOT NULL AND punt_global IS NOT NULL AND cole_nombre_establecimiento = INSTITUCION EDUCATIVA DEPARTAMENTAL FRANCISCO JOSE DE CALDAS';
    axios.get(url)
        .then((response) => {
            console.log(response);
        })
        .catch((err) => {
            console.log(err);
        })
}

const convCSV = createCsv({
    path:".././csv/primer.csv",
    header:['periodo','cole_nombre_establecimiento','estu_genero','desemp_ingles','punt_ingles','punt_matematicas','punt_sociales_ciudadanas','punt_c_naturales','punt_lectura_critica','punt_global'].map((item) => ({ id: item, title: item }))
})

const cargaDatosCsv= async ()=>{
    const data = await getApi();
    const file_data = await JSON.stringify(data);
    const parsed_data = await JSON.parse(file_data);

    try {
        await convCSV.writeRecords(parsed_data);
    } catch (error) {
        console.log(error);
    }
}

export { cargaDatosCsv };