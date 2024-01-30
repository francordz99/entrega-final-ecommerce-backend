// multerConfig.js
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { __dirname } from '../utils.js';

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const { fieldname } = file;
        let folder;

        // Configurar las carpetas según el tipo de archivo
        switch (fieldname) {
            case 'id':
                folder = 'documents/id';
                break;
            case 'domicilio':
                folder = 'documents/domicilio';
                break;
            case 'estadoCuenta':
                folder = 'documents/estadoCuenta';
                break;
            default:
                folder = 'uploads';
        }

        // Ruta modificada para guardar en carpeta 'storage' directamente
        const storagePath = path.join(__dirname, '..', 'src', 'storage', folder);

        try {
            // Verificar si la carpeta de destino existe, si no, crearla
            await fs.mkdir(storagePath, { recursive: true });
            cb(null, storagePath);
        } catch (error) {
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

export default upload;
