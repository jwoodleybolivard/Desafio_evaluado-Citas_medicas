import http from 'http';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import _ from 'lodash';
import chalk from 'chalk';

const PORT = process.env.PORT || 3000;
const server = http.createServer();

// Manejador de solicitudes HTTP
server.on('request', async (req, res) => {
    if (req.method === 'GET' && req.url === '/usuarios') {
        try {
            // Registrar usuarios
            const usuarios = await registrarUsuarios();

            // Dividir la lista de usuarios por sexo
            const { hombres, mujeres } = dividirUsuariosPorSexo(usuarios);

            // Construir la lista de usuarios enumerados
            let listaUsuarios = 'Mujeres:\n';
            mujeres.forEach((usuario, index) => {
                listaUsuarios += `${index + 1}. Nombre: ${usuario.nombre} - Apellido: ${usuario.apellido} - ID: ${usuario.id} - Timestamp: ${usuario.timestamp}\n`;
            });
            listaUsuarios += '\nHombres:\n';
            hombres.forEach((usuario, index) => {
                listaUsuarios += `${index + 1}. Nombre: ${usuario.nombre} - Apellido: ${usuario.apellido} - ID: ${usuario.id} - Timestamp: ${usuario.timestamp}\n`;
            });

            // Imprimir la lista de usuarios en la consola con Chalk
            console.log(chalk.bgWhite.blue(listaUsuarios));

            // Enviar la lista de usuarios al cliente
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end(listaUsuarios);
        } catch (error) {
            // Enviar una respuesta de error al cliente
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Error interno del servidor');
        }
    } else {
        // Ruta no encontrada
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Ruta no encontrada');
    }
});

// Función para registrar y devolver usuarios
async function registrarUsuarios() {
    try {
        // Registrar 5 hombres
        const hombres = await registrarUsuariosPorSexo('male', 5);
        // Registrar 5 mujeres
        const mujeres = await registrarUsuariosPorSexo('female', 5);
        // Combinar y devolver usuarios
        return hombres.concat(mujeres);
    } catch (error) {
        console.error('Error al registrar usuarios:', error.message);
        throw error;
    }
}

// Función para registrar usuarios por sexo
async function registrarUsuariosPorSexo(sexo, cantidad) {
    try {
        const usuarios = [];
        for (let i = 0; i < cantidad; i++) {
            const { data } = await axios.get('https://randomuser.me/api/', { params: { gender: sexo } });
            const usuario = {
                nombre: data.results[0].name.first,
                apellido: data.results[0].name.last,
                id: uuidv4().substring(0, 6), // Tomar solo los primeros 6 caracteres de la ID generada por UUID
                timestamp: moment().format('MMMM Do YYYY, h:mm:ss a'), // Obtener la fecha actual formateada con Moment
                sexo: sexo === 'male' ? 'hombre' : 'mujer'
            };
            usuarios.push(usuario);
        }
        return usuarios;
    } catch (error) {
        console.error(`Error al registrar usuarios ${sexo}:`, error.message);
        throw error;
    }
}

// Función para dividir la lista de usuarios por sexo
function dividirUsuariosPorSexo(usuarios) {
    const hombres = _.filter(usuarios, { sexo: 'hombre' });
    const mujeres = _.filter(usuarios, { sexo: 'mujer' });
    return { hombres, mujeres };
}

// Levantar el servidor con Nodemon
server.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
