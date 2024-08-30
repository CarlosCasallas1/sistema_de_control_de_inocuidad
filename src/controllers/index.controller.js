// Importar la función getConnection desde el módulo de conexión
import { getConnection } from "../models/connection";
import sql from 'mssql';
import bcrypt from 'bcrypt';

// Objeto que contiene las funciones del controlador
const indexController = {};

// Función para encriptar contraseñas
async function encryptPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
}

// Controlador que se utiliza para manejar la solicitud de la página principal
indexController.index = (req, res) => {
    res.render('index', {
        title: 'Página Principal'
    });
};

indexController.inicio = (req, res) => {
    res.render('inicio', {
        title: 'Página de Registro e Inicio'
    });
};

// Controlador para insertar usuarios en la base de datos
indexController.insertarUsuarios = async (req, res) => {
    try {
        const { ID_Usuarios, Nombre, ID_InocuidadFK, Contrasena, Rol } = req.body;
        
        // Trim and parse ID_InocuidadFK if needed
        const trimmedID_InocuidadFK = ID_InocuidadFK ? ID_InocuidadFK.trim() : null;
        const ID_InocuidadFKInt = trimmedID_InocuidadFK ? parseInt(trimmedID_InocuidadFK, 10) : null;

        // Validar datos
        if (!ID_Usuarios || !Nombre || isNaN(ID_InocuidadFKInt) || !Contrasena || !Rol) {
            throw new Error("Faltan datos necesarios");
        }

        // Encriptar contraseña
        const hashedPassword = await encryptPassword(Contrasena);
        
        // Obtener conexión y ejecutar consulta
        const conn = await getConnection();
        const query = `
            INSERT INTO Usuarios (ID_Usuarios, Nombre, ID_InocuidadFK, Contrasena, Rol) 
            VALUES (@ID_Usuarios, @Nombre, @ID_InocuidadFK, @Contrasena, @Rol)
        `;
        await conn.request()
            .input("ID_Usuarios", sql.Int, ID_Usuarios)
            .input("Nombre", sql.VarChar, Nombre)
            .input("ID_InocuidadFK", sql.Int, ID_InocuidadFKInt)
            .input("Contrasena", sql.VarChar, hashedPassword)
            .input("Rol", sql.VarChar, Rol)
            .query(query);
        res.redirect('/listarU');
    } catch (error) {
        console.error('Error al insertar usuario:', error);
        res.status(500).send('Error al insertar usuario');
    }
};

// Controlador para listar usuarios desde la base de datos
indexController.listarUsuarios = async (req, res) => {
    try {
        const conn = await getConnection();
        const result = await conn.request().query('SELECT * FROM Usuarios');
        res.render('listarU', {
            title: 'Página de Usuarios',
            data: result.recordset
        });
    } catch (error) {
        console.log(error);
    }
};

// Controlador para mostrar la ventana de confirmación de eliminación
indexController.mostrarConfirmacionEliminacion = async (req, res) => {
    try {
        const { ID_Usuarios } = req.params;
        res.render('confirmarEliminacion', { ID_Usuarios });
    } catch (error) {
        console.log(error);
    }
};

// Controlador para confirmar la eliminación del usuario
indexController.confirmarEliminacion = async (req, res) => {
    try {
        const conn = await getConnection();
        const { ID_Usuarios } = req.params;
        await conn.request()
            .input("ID_Usuarios", sql.Int, ID_Usuarios)
            .query("DELETE FROM Usuarios WHERE ID_Usuarios = @ID_Usuarios");
        res.redirect('/listarU');
    } catch (error) {
        console.log(error);
    }
};

// Función para buscar usuarios en la base de datos
indexController.buscarUsuarios = async (req, res) => {
    try {
        const conn = await getConnection();
        const { txtBuscar } = req.body;
        const result = await conn.request()
            .input('txtBuscar', sql.VarChar, txtBuscar)
            .query("SELECT * FROM Usuarios WHERE Nombre = @txtBuscar");
        res.render('listarU', {
            title: 'Página de Usuarios',
            data: result.recordset
        });
    } catch (error) {
        console.log(error);
    }
};

// Controlador para editar la información de un usuario
indexController.editarUsuarios = async (req, res) => {
    try {
        const conn = await getConnection();
        const { ID_Usuarios } = req.params;
        const result = await conn.request()
            .input("ID_Usuarios", sql.Int, ID_Usuarios)
            .query("SELECT * FROM Usuarios WHERE ID_Usuarios = @ID_Usuarios");
        res.render('editarUsuarios', {
            title: 'Editar Usuario',
            data: result.recordset[0]
        });
    } catch (error) {
        console.log(error);
    }
};

// Controlador para actualizar la información de un usuario
indexController.actualizarUsuarios = async (req, res) => {
    try {
        const conn = await getConnection();
        const { ID_Usuarios } = req.params;
        const { Nombre, Contrasena, Rol } = req.body;

        if (!ID_Usuarios || !Nombre || !Contrasena || !Rol) {
            return res.status(400).send('Faltan datos necesarios.');
        }

        const hashedPassword = await encryptPassword(Contrasena);
        await conn.request()
            .input("ID_Usuarios", sql.Int, ID_Usuarios)
            .input("Nombre", sql.VarChar, Nombre)
            .input("Contrasena", sql.VarChar, hashedPassword)
            .input("Rol", sql.VarChar, Rol)
            .query("UPDATE Usuarios SET Nombre = @Nombre, Contrasena = @Contrasena, Rol = @Rol WHERE ID_Usuarios = @ID_Usuarios");

        res.redirect('/listarU');
    } catch (error) {
        console.log('Error en la actualización de usuario:', error);
        res.status(500).send('Error al actualizar el usuario.');
    }
};

// Controlador para editar la información de un estudiante
indexController.editarEstudiante = async (req, res) => {
    try {
        const conn = await getConnection();
        const { ID_Usuarios } = req.params;
        const result = await conn.request()
            .input("ID_Usuarios", sql.Int, ID_Usuarios)
            .query("SELECT * FROM Usuarios WHERE ID_Usuarios = @ID_Usuarios");
        res.render('editarEstudiante', {
            title: 'Editar Estudiante',
            data: result.recordset[0]
        });
    } catch (error) {
        console.log(error);
    }
};

// Controlador para actualizar la información de un estudiante
indexController.actualizarEstudiante = async (req, res) => {
    try {
        const conn = await getConnection();
        const { ID_Usuarios } = req.params;
        const { Correo, Contrasena } = req.body;

        const hashedPassword = await encryptPassword(Contrasena);
        await conn.request()
            .input("ID_Usuarios", sql.Int, ID_Usuarios)
            .input("Correo", sql.VarChar, Correo)
            .input("Contrasena", sql.VarChar, hashedPassword)
            .query("UPDATE Usuarios SET Correo = @Correo, Contrasena = @Contrasena WHERE ID_Usuarios = @ID_Usuarios");

        res.redirect('/iniciarSesion');
    } catch (error) {
        console.log(error);
    }
};

// Controlador para verificar si el usuario ya inició sesión
indexController.iniciarSesion = async (req, res) => {
    try {
        if (req.session.userID) {
            const conn = await getConnection();
            const result = await conn.request()
                .input('ID_Usuarios', sql.Int, req.session.userID)
                .query('SELECT * FROM Usuarios WHERE ID_Usuarios = @ID_Usuarios');

            res.render('iniciarSesion', {
                title: 'Operario',
                data: result.recordset
            });
        } else {
            res.redirect('/inicio');
        }
    } catch (error) {
        console.log(error);
    }
};

indexController.Operario = async (req, res) => {
    try {
        if (req.session.userID) {
            const conn = await getConnection();
            const result = await conn.request()
                .input('ID_Usuarios', sql.Int, req.session.userID)
                .query('SELECT * FROM Usuarios WHERE ID_Usuarios = @ID_Usuarios');

            res.render('Operario', {
                title: 'Operario',
                data: result.recordset
            });
        } else {
            res.redirect('/inicio');
        }
    } catch (error) {
        console.log(error);
    }
};


// Controlador para procesar el inicio de sesión
indexController.processLogin = async (req, res) => {
    const { ID_Usuarios, Contrasena, Rol } = req.body;
    try {
        const conn = await getConnection();
        const query = "SELECT ID_Usuarios, Nombre, Rol, Contrasena FROM Usuarios WHERE ID_Usuarios = @ID_Usuarios";
        const result = await conn.request()
            .input("ID_Usuarios", sql.Int, ID_Usuarios)
            .query(query);

        if (result.recordset.length > 0) {
            const storedPassword = result.recordset[0].Contrasena;
            const match = await bcrypt.compare(Contrasena, storedPassword);
            if (match) {
                const userRol = result.recordset[0].Rol;
                if (Rol && userRol !== Rol) {
                    res.redirect('/?error=Rol%20incorrecto');
                    return;
                }
                req.session.userID = result.recordset[0].ID_Usuarios;
                if (userRol === 'Administrador') {
                    res.redirect('/listarU');
                } else if (userRol === 'Operario') {
                    res.redirect('/Operario');
                } else {
                    res.redirect('/');
                }
            } else {
                res.redirect('/?error=Contraseña%20incorrecta');
            }
        } else {
            res.redirect('/?error=Usuario%20no%20encontrado');
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('Error al procesar el inicio de sesión');
    }
};

export default indexController;
