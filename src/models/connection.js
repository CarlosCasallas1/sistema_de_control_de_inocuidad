// Importar la configuración de la base de datos desde otro archivo
import config from '../config';

// Importar la biblioteca mssql para interactuar con SQL Server desde Node.js
import sql from 'mssql';

// Objeto que contiene la cadena de conexión a la base de datos
const stringConnection = {
    user: config.user,
    password: config.password,
    server: config.server,
    database: config.database,
    options: {
        trustServerCertificate: true,
    }
};

// Función asincrónica para establecer una conexión a la base de datos
export async function getConnection() {
    try {
        // Conectar a la base de datos utilizando la cadena de conexión
        const conn = await sql.connect(stringConnection);
        // Devolver la conexión establecida
        return conn;
    } catch (error) {
        // Manejar errores de conexión imprimiéndolos en la consola
        console.log(error);
    }
}
