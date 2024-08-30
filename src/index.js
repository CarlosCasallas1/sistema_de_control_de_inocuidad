// Importación de módulos
import express from 'express';
import { engine } from 'express-handlebars'; // Importa engine de handlebars
import bodyParser from 'body-parser'; // Middleware para analizar cuerpos de solicitudes entrantes en un middleware antes de los manejadores
import path from 'path'; // Módulo para manejar y transformar rutas de archivo
import config from './config'; // Configuración de la aplicación
import router from './routes/index.routes'; // Importa las rutas definidas en index.routes.js

import session from 'express-session'; // Middleware para la gestión de sesiones
import crypto from 'crypto'; // Módulo criptográfico para encriptar contraseñas


const app = express(); // Inicializa la aplicación Express

// Configuración de sesiones de Express
app.use(session({
    secret: 'mi_secreto', // Clave secreta para firmar la cookie de sesión
    resave: false, // No vuelva a guardar sesiones que no hayan cambiado
    saveUninitialized: true // Guarde sesiones nuevas aunque no estén inicializadas
}));

// Función para encriptar la contraseña con sal
function encryptPassword(password, salt) {
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512'); // Genera un hash usando la contraseña y la sal
    return hash.toString('hex'); // Devuelve el hash como cadena hexadecimal
}

// Función para verificar la contraseña
function verifyPassword(password, hashedPassword, salt) {
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512'); // Genera un hash usando la contraseña y la sal
    return hashedPassword === hash.toString('hex'); // Verifica si el hash de la contraseña coincide con el hash almacenado
}

// Configuración del motor de plantillas Handlebars
app.engine('.hbs', engine({
    defaultLayout: 'main', // Diseño predeterminado para las vistas
    extname: '.hbs' // Extensión de los archivos de plantilla
}));
app.set('view engine', '.hbs'); // Configura el motor de plantillas

// Configuración de la carpeta de vistas y archivos estáticos
app.set('views', path.join(__dirname, 'views')); // Directorio de vistas
app.use(express.static(path.join(__dirname, 'public'))); // Directorio de archivos estáticos

// Middleware para analizar cuerpos de solicitud codificados en url y json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importa las rutas definidas en index.routes.js
app.use(router);

// Ruta para el registro de usuarios
app.post('/signup', (req, res) => {
    // Obtener la contraseña del cuerpo de la solicitud
    const password = req.body.password;

    // Generar un salt aleatorio
    const salt = generateSalt();

    // Encriptar la contraseña
    const hashedPassword = encryptPassword(password, salt);

    // Aquí guardarías 'hashedPassword' en tu base de datos

    // Puedes enviar una respuesta de éxito o redireccionar a otra página
    res.send('Usuario registrado con éxito');
});

// Ruta para el inicio de sesión
app.post('/login', async (req, res) => {
    const { ID_Usuarios, ContraseNa } = req.body;

    // Buscar el usuario en la base de datos por ID_Usuarios
    const user = await getUserByID(ID_Usuarios);

    if (user) {
        // Verificar la contraseña
        if (verifyPassword(ContraseNa, user.ContraseNa, user.salt)) {
            // Contraseña correcta, iniciar sesión
            req.session.userID = user.ID_Usuarios; // Guarda el ID de usuario en la sesión
            res.redirect('/dashboard'); // Redirecciona al panel de control
        } else {
            // Contraseña incorrecta
            res.redirect('/login?error=InvalidCredentials'); // Redirecciona con un mensaje de error
        }
    } else {
        // Usuario no encontrado
        res.redirect('/login?error=UserNotFound'); // Redirecciona con un mensaje de error
    }
});

// Escucha en el puerto 8083
app.listen(8083, () => {
    console.log("Activo en localhost:8083");
});
