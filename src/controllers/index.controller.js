// Importar la función getConnection desde el módulo de conexión
import { getConnection } from "../models/connection"

// Importar el módulo crypto para encriptar contraseñas
import crypto from 'crypto';

// Función para encriptar la contraseña/////////////////////////////////
function encryptPassword(password) {
    // Crear un objeto hash utilizando el algoritmo SHA-256
    const hash = crypto.createHash('sha256');
    // Actualizar el hash con la contraseña proporcionada
    hash.update(password);
    // Devolver el hash en formato hexadecimal
    return hash.digest('hex');
}

// Objeto que contiene las funciones del controlador
const indexController = {}

// Definición de la función para desencriptar la contraseña
function decryptPassword(hashedPassword) {
    // Crear un objeto hash utilizando el algoritmo SHA-256
    const hash = crypto.createHash('sha256');
    // Actualizar el hash con la contraseña encriptada
    hash.update(hashedPassword);
    // Devolver el hash en formato hexadecimal
    return hash.digest('hex');
}

///////////////////////////////////////////////////////////////////////////////////////////

//Controlador que se utlizo para todas las vistas 
// Función para manejar la solicitud de la página principal
indexController.index = (req, res) => {
    // Renderiza la vista 'index' y pasa datos adicionales a la vista
    res.render('index', {
        title: 'Página Principal' // Título de la página
    });
}
indexController.inicio=(req, res) =>{
    res.render('inicio',{
        title : 'pagina registro inicio'
    });
}
indexController.comoLlegar=(req, res) =>{
    res.render('comoLlegar',{
        title : 'Mapa'
    });
}
indexController.conoce=(req, res) =>{
    res.render('conoce',{
        title : 'pagina conoce'
    });
}

indexController.contacto=(req, res) =>{
    res.render('contacto',{
        title : 'pagina contacto'
    });
}
indexController.informacion=(req, res) =>{
    res.render('informacion',{
        title : 'pagina informacion'
    });
}
//////////////////////////////////////////////////////////////////////////

//Controladores para el manejo de solicitudes del usuario

// Controlador para insertar usuarios en la base de datos
indexController.insertarUsuarios = async (req, res) => {
    try {
        // Obtener una conexión a la base de datos
        const conn = await getConnection();
        // Extraer datos del cuerpo de la solicitud HTTP
        const { ID_Usuarios, Nombre, Apellidos, Correo, ContraseNa, Rol } = req.body;
        // Encriptar la contraseña antes de insertarla en la base de datos
        const hashedPassword = encryptPassword(ContraseNa);
        // Consulta SQL para insertar un nuevo usuario
        const query = `
            INSERT INTO Usuarios (ID_Usuarios, Nombre, Apellidos, Correo, ContraseNa, Rol) 
            VALUES (@ID_Usuarios, @Nombre, @Apellidos, @Correo, @ContraseNa, @Rol)
        `;
        // Ejecutar la consulta SQL
        await conn.request()
            .input("ID_Usuarios", ID_Usuarios)
            .input("Nombre", Nombre)
            .input("Apellidos", Apellidos)
            .input("Correo", Correo)
            .input("ContraseNa", hashedPassword)
            .input("Rol", Rol)
            .query(query);
        // Redirigir a la página 'listarU' después de la inserción exitosa
        res.redirect('listarU');
    } catch (error) {
        // Manejar cualquier error que ocurra durante el proceso
        console.log(error);
    }
};

// Controlador para listar usuarios desde la base de datos
indexController.listarUsuarios = async (req, res)=> {
    try {
        // Obtener una conexión a la base de datos
        const conn = await getConnection();
        // Ejecutar una consulta SQL para obtener todos los usuarios
        const result = await conn.request().query('select * from Usuarios');
        // Renderizar la vista 'listarU' y pasar los datos de los usuarios a la vista
        res.render('listarU', {
            title: 'Página de Usuarios',
            data: result.recordset
        });
    } catch (error) {
        // Manejar cualquier error que ocurra durante el proceso
        console.log(error);
    }
}

// Método para mostrar la ventana de confirmación de eliminación
indexController.mostrarConfirmacionEliminacion = async (req, res) => {
    try {
        const { ID_Usuarios } = req.params;
        // Aquí podrías cargar los detalles del usuario si lo necesitas
        res.render('confirmarEliminacion', { ID_Usuarios });
    } catch (error) {
        console.log(error);
    }
};

// Método para confirmar la eliminación del usuario
indexController.confirmarEliminacion = async (req, res) => {
    try {
        const conn = await getConnection();
        const { ID_Usuarios } = req.params;
        // Eliminar el usuario de la base de datos
        await conn.request().query("DELETE FROM Usuarios WHERE ID_Usuarios = '" + ID_Usuarios + "'");
        // Redirigir al usuario a la lista de usuarios después de eliminar
        res.redirect('/listarU');
    } catch (error) {
        console.log(error);
    }
};

//Controladores que sriven para usuarios y estudiantes////////////////////////////////////////////////
// Función para buscar usuarios en la base de datos
indexController.buscarUsuarios = async (req, res)=> {
    try {
        // Establecer conexión con la base de datos
        const conn = await getConnection();
        
        // Obtener el texto de búsqueda del cuerpo de la solicitud
        const {txtBuscar} = req.body;
        
        // Realizar consulta SQL para buscar usuarios por nombre o apellidos
        const result = await conn.request().query("SELECT * FROM Usuarios WHERE Nombre = '" + txtBuscar + "'or Apellidos = '" + txtBuscar + "'");
        
        // Renderizar una plantilla de listar usuarios y enviarla al cliente
        res.render('listarU',{
            title: 'Pg Usuarios',
            data: result.recordset, // Los resultados de la consulta se pasan a la plantilla
        });
    } catch (error) {
        // Manejar errores, si los hay, imprimiéndolos en la consola
        console.log(error);
    }
}

// Función para editar la información de un usuario en la base de datos
indexController.editarUsuarios = async (req, res)=> {
    try {
        // Establecer conexión con la base de datos
        const conn = await getConnection();
        
        // Obtener el ID del usuario a editar de los parámetros de la solicitud
        const {ID_Usuarios} = req.params;
        
        // Realizar consulta SQL para seleccionar el usuario por su ID
        const result = await conn.request().query("SELECT * FROM Usuarios WHERE ID_Usuarios = '" + ID_Usuarios + "'");
        
        // Renderizar una plantilla de edición de usuarios y enviarla al cliente
        res.render('editarUsuarios',{
            title: 'Editar Usuario',
            data: result.recordset[0] // Los resultados de la consulta se pasan a la plantilla
        });
    } catch (error) {
        // Manejar errores, si los hay, imprimiéndolos en la consola
        console.log(error);
    }
}


// Función para actualizar la información de un usuario en la base de datos
indexController.actualizarUsuarios = async (req, res)=> {
    try {
        // Establecer conexión con la base de datos
        const conn = await getConnection();
        
        // Obtener el ID del usuario a actualizar de los parámetros de la solicitud
        const { ID_Usuarios } = req.params;
        
        // Obtener los datos actualizados del usuario del cuerpo de la solicitud
        const { Nombre, Apellidos, Correo, ContraseNa, Rol } = req.body; // Se espera que estos datos vengan de un formulario HTML
        
        // Encriptar la contraseña antes de almacenarla en la base de datos
        const hashedPassword = encryptPassword(ContraseNa);
        
        // Realizar la consulta SQL para actualizar los datos del usuario
        const result = await conn.request()
            .input("ID_Usuarios", ID_Usuarios)
            .input("Nombre", Nombre)
            .input("Apellidos", Apellidos)
            .input("Correo", Correo)
            .input("ContraseNa", hashedPassword) // Se usa la contraseña encriptada
            .input("Rol", Rol)
            .query("UPDATE Usuarios SET Nombre = @Nombre, Apellidos = @Apellidos, Correo = @Correo, ContraseNa = @ContraseNa, Rol = @Rol WHERE ID_Usuarios = @ID_Usuarios");
        
        // Redireccionar al usuario a alguna página después de actualizar los datos
        res.redirect('/listarU');
    } catch (error) {
        // Manejar errores, si los hay, imprimiéndolos en la consola
        console.log(error);
    }
}


indexController.editarEstudiante = async (req, res)=> {
    try {
        const conn = await getConnection()
        const {ID_Usuarios}=req.params
        const result = await conn.request().query("SELECT * FROM Usuarios WHERE ID_Usuarios = '" + ID_Usuarios + "'")
        res.render('editarEstudiante',{
            title: 'Editar Estudiante',
            data: result.recordset[0]
        })
    }catch (error){
        console.log (error)
    }
}


indexController.actualizarEstudiante = async (req, res)=> {
    try {
        const conn = await getConnection()
        const { ID_Usuarios }=req.params
        const {  Correo, ContraseNa } = req.body //name del formulario
        const hashedPassword = encryptPassword(ContraseNa);
        const result = await conn.request()
        .input("ID_Usuarios", ID_Usuarios)
        .input("Correo", Correo)
        .input("ContraseNa", hashedPassword)
        .query("UPDATE Usuarios SET Correo = @Correo, ContraseNa = @ContraseNa WHERE ID_Usuarios = @ID_Usuarios");
        res.redirect('/iniciarSesion')
    }catch (error){
        console.log (error)
    }
}

///////////////////////////////////////////////////////////////////////////////////////////
// Controlador para verificar si el usuario ya inició sesión
indexController.iniciarSesion = async (req, res) => { 
    try {
        // Verificar si hay un userID almacenado en la sesión
        if (req.session.userID) {
            // Si hay un userID en la sesión, buscar al usuario en la base de datos
            const conn = await getConnection();
            const result = await conn.request()
                .input('ID_Usuarios', req.session.userID)
                .query('SELECT * FROM Usuarios WHERE ID_Usuarios = @ID_Usuarios');
            
            // Renderizar la página de inicio de sesión con los datos del usuario encontrado
            res.render('iniciarSesion', {
                title: 'iniciarSesion',
                data: result.recordset // Los datos del usuario se pasan a la plantilla
            });
        } else {
            // Si no hay un userID en la sesión, redirigir al usuario a la página de inicio
            res.redirect('/inicio');
        }
    } catch (error) {
        // Manejar errores, si los hay, imprimiéndolos en la consola
        console.log(error);
    }
}


// Controlador para procesar el inicio de sesión
indexController.processLogin = async (req, res) => {
    const { ID_Usuarios, ContraseNa, Rol } = req.body;
    try {
        // Establecer conexión con la base de datos
        const conex = await getConnection();
        
        // Consulta para buscar al usuario por su ID
        const query = "SELECT ID_Usuarios, Nombre, Rol, ContraseNa FROM Usuarios WHERE ID_Usuarios = @ID_Usuarios";
        const result = await conex.request()
            .input("ID_Usuarios", ID_Usuarios)
            .query(query);

        // Verificar si se encontró algún usuario con el ID proporcionado
        if (result.recordset.length > 0) {
            // Obtener la contraseña almacenada en la base de datos
            const storedPassword = result.recordset[0].ContraseNa;
            
            // Comparar la contraseña proporcionada encriptada con la contraseña almacenada
            if (encryptPassword(ContraseNa) === storedPassword) {
                const userRol = result.recordset[0].Rol;
                // Verificar si se seleccionó un rol y si el usuario tiene ese rol
                if (Rol && userRol !== Rol) {
                    res.redirect('/?error=Rol%20incorrecto');
                    return;
                }
                // Redireccionar al usuario basado en su rol
                if (userRol === 'Administrador') {
                    req.session.userID = result.recordset[0].ID_Usuarios;
                    res.redirect('/listarU');
                } else if (userRol === 'Estudiante') {
                    req.session.userID = result.recordset[0].ID_Usuarios;
                    res.redirect('/iniciarSesion');
                } else {
                    req.session.userID = result.recordset[0].ID_Usuarios;
                    res.redirect('/');
                }
            } else {
                // Redireccionar si las credenciales son incorrectas
                res.redirect('/?error=Credenciales%20incorrectas');
            }
        } else {
            // Redireccionar si las credenciales son incorrectas
            res.redirect('/?error=Credenciales%20incorrectas');
        }
    } catch (error) {
        // Manejar errores, si los hay, imprimiéndolos en la consola
        console.log(error);
    }
};

// Exportar el controlador para que pueda ser utilizado en otros archivos
export default indexController;
