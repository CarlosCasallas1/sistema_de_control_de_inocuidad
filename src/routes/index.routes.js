// Importar Express y el enrutador desde Express
import express, { Router } from 'express';

// Importar el controlador de índice que contiene las funciones para manejar las rutas
import indexController from '../controllers/index.controller';

// Crear un nuevo enrutador utilizando Express
const router = express.Router();

// Definir middleware para verificar la sesión
function requireLogin(req, res, next) {
    if (req.session.userID) {
        // Si hay un userID en la sesión, continuar con la solicitud
        next();
    } else {
        // Si no hay un userID en la sesión, redirigir a la página de inicio de sesión
        res.redirect('/inicio');
    }
}

// Rutas accesibles sin necesidad de autenticación //
//áginas públicas que cualquier persona puede ver 
//sin iniciar sesión, como la página de inicio, contacto, etc.
router.get('/', indexController.index);
router.get('/inicio', indexController.inicio);

// Rutas que requieren autenticación //
//Acciones que solo pueden realizar usuarios autenticados, como ver la lista de usuarios,
// editar información, etc. Estas rutas necesitan que el usuario haya iniciado sesión antes
// de acceder a ellas.
router.get('/listarU', indexController.listarUsuarios);
router.post('/insertarUsuarios', indexController.insertarUsuarios);
router.post('/buscarUsuarios', indexController.buscarUsuarios);
router.get('/iniciarSesion', indexController.iniciarSesion);
router.post('/iniciarSesion', indexController.processLogin);
router.get('/editarUsuarios/:ID_Usuarios', indexController.editarUsuarios);
router.get('/editarEstudiante/:ID_Usuarios', indexController.editarEstudiante);
router.post('/actualizarUsuarios/:ID_Usuarios', indexController.actualizarUsuarios);
router.post('/actualizarEstudiante/:ID_Usuarios', indexController.actualizarEstudiante);
router.get('/confirmarEliminacion/:ID_Usuarios', indexController.mostrarConfirmacionEliminacion);
router.post('/confirmarEliminacion/:ID_Usuarios', indexController.confirmarEliminacion);

// Exportar el enrutador para que pueda ser utilizado en otros archivos
export default router;

//get obtiene informacion del servidor
//post envia datos al servidor para su procesamiento
