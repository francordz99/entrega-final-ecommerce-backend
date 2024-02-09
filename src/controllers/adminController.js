import Product from "../dao/models/productModel.js";
import User from "../dao/models/userModel.js";
import jwt from 'jsonwebtoken';
import { adminErrors } from "../services/errors/adminErrors.js";
import { mailingErrors } from '../services/errors/mailingErrors.js';
import MailingService from '../services/mailing.service.js';
import { config } from "../config/dotenvConfig.js";
import { logger } from "../helpers/loggerConfig.js";

const adminController = {
    getAdmin: async (req, res) => {
        logger.info('Renderizando la página de administrador');
        res.render('admin');
    },
    getProduct: async (req, res) => {
        try {
            const { code } = req.query;
            const existingProduct = await Product.findOne({ code });

            if (!existingProduct) {
                adminErrors.getProductNotFoundError();
            }

            logger.info('Renderizando la página de administrador con información del producto');
            res.render('admin', { product: existingProduct });
        } catch (error) {
            logger.error(`Error en getProduct: ${error}`);
            adminErrors.getProductError(error);
        }
    },
    postProduct: async (req, res) => {
        try {
            const { title, description, price, thumbnail, code, stock, category } = req.body;
            const newProduct = new Product({
                title,
                description,
                price,
                thumbnail,
                code,
                stock,
                category,
            });
            await newProduct.save();
            const successMessage = 'Producto agregado a la base de datos con éxito.';
            logger.info(successMessage);
            res.render('admin', { successMessage });
        } catch (error) {
            logger.error(`Error en postProduct: ${error}`);
            adminErrors.addProductError(error);
        }
    },
    putProduct: async (req, res) => {
        try {
            const { code, title, description, price, thumbnail, stock, category } = req.body;
            const existingProduct = await Product.findOne({ code });

            if (!existingProduct) {
                logger.error('Producto no encontrado');
                return res.status(404).send('Producto no encontrado.');
            }

            existingProduct.title = title || existingProduct.title;
            existingProduct.description = description || existingProduct.description;
            existingProduct.price = price || existingProduct.price;
            existingProduct.thumbnail = thumbnail || existingProduct.thumbnail;
            existingProduct.stock = stock || existingProduct.stock;
            existingProduct.category = category || existingProduct.category;

            await existingProduct.save();

            const successMessage = 'Producto editado con éxito.';
            logger.info(successMessage);
            res.render('admin', { successMessage });

        } catch (error) {
            logger.error(`Error en putProduct: ${error}`);
            adminErrors.editProductError(error);
        }
    },
    deleteProduct: async (req, res) => {
        try {
            const { code } = req.body;
            const existingProduct = await Product.findOne({ code });

            if (!existingProduct) {
                logger.error('Producto no encontrado');
                return res.status(404).send('Producto no encontrado.');
            }
            const ownerEmail = existingProduct.owner;
            const owner = await User.findOne({ email: ownerEmail });
            if (owner && owner.role === 'premium') {
                const emailResult = await MailingService.sendProductDeletedEmail(ownerEmail, existingProduct);
                if (!emailResult.success) {
                    logger.error('Error al enviar el correo electrónico al usuario premium');
                    mailingErrors.sendProductDeletedEmailError();
                }
            }

            await Product.deleteOne({ code });

            const successMessage = 'Producto eliminado con éxito.';
            logger.info(successMessage);
            res.render('admin', { successMessage });
        } catch (error) {
            logger.error(`Error en deleteProduct: ${error}`);
            adminErrors.deleteProductError(error);
        }
    },
    editPermissions: async (req, res) => {
        try {
            const { email, permissionLevel } = req.body;
            const token = req.cookies.token;
            const decodedToken = jwt.verify(token, config.jwt.jwtSecret);
            const adminEmail = decodedToken.username;
            if (email === adminEmail) {
                logger.warn('Intento de cambiar el rol del propio administrador');
                return res.status(403).send('No puedes cambiar tu propio rol.');
            }
            const user = await User.findOne({ email: email });
            if (!user) {
                logger.error('Usuario no encontrado');
                return res.status(404).send('Usuario no encontrado.');
            }
            const validRoles = ['user', 'premium', 'admin'];
            if (!validRoles.includes(permissionLevel)) {
                logger.error('Rol de permisos no válido');
                return res.status(400).send('Rol de permisos no válido.');
            }
            user.role = permissionLevel;
            await user.save();
            const successMessage = 'Permisos actualizados con éxito.';
            logger.info(successMessage);
            res.render('admin', { successMessage });
        } catch (error) {
            logger.error(`Error en editPermissions: ${error}`);
            adminErrors.editPermissionsError(error);
        }
    },
    checkDocuments: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).send('Usuario no encontrado.');
            }

            const requiredDocuments = ['id', 'domicilio', 'estadoCuenta'];
            const userDocumentNames = user.documents.map(doc => doc.name);

            let message = '';

            if (requiredDocuments.every(doc => userDocumentNames.includes(doc))) {
                message = 'El usuario por el que consultaste ha subido los tres documentos necesarios. Está apto para subir a Premium.';
            } else if (requiredDocuments.some(doc => userDocumentNames.includes(doc))) {
                message = 'El usuario por el que consultaste ha subido la documentación pero está incompleta. Por favor, revise y evalúe si de verdad quiere subir al usuario a Premium.';
            } else {
                message = 'El usuario por el que consultaste no ha subido ningún documento. ¿Está seguro de querer cambiar el rol del usuario sin documentación?';
            }

            res.render('admin', { message });
        } catch (error) {
            logger.error(`Error en checkDocuments: ${error}`);
            res.status(500).send('Ha ocurrido un error al revisar los documentos.');
        }
    },
    deleteInactive: async (req, res) => {
        try {
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            const inactiveUsers = await User.find({ last_connection: { $lt: twoDaysAgo } });
            const userEmails = inactiveUsers.map(user => user.email);
            const result = await User.deleteMany({ last_connection: { $lt: twoDaysAgo } });

            if (result.deletedCount > 0) {
                const successMessage = `Se han eliminado ${result.deletedCount} usuarios inactivos con éxito.`;
                logger.info(successMessage);
                for (const userEmail of userEmails) {
                    await MailingService.sendAccountDeletedInactiveEmail(userEmail);
                }
                res.render('admin', { successMessage });
            } else {
                const errorMessage = 'No se encontraron usuarios inactivos para eliminar.';
                logger.warn(errorMessage);
                res.render('admin', { errorMessage });
            }
        } catch (error) {
            logger.error(`Error en deleteInactive: ${error}`);
            const errorMessage = 'Ha ocurrido un error al eliminar usuarios inactivos.';
            res.status(500).render('admin', { errorMessage });
        }
    },
    getAllUsers: async (req, res) => {
        try {
            const users = await User.find({}, 'nombre apellido role email');
            res.render('admin', { users });
        } catch (error) {
            logger.error(`Error en getAllUsers: ${error}`);
            const errorMessage = 'Ha ocurrido un error al obtener todos los usuarios.';
            res.status(500).render('admin', { errorMessage });
        }
    },
    findUser: async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email }, { password: 0 });
            res.render('admin', { user });
        } catch (error) {
            console.error(`Error en findUser: ${error}`);
            res.status(500).send('Ha ocurrido un error al buscar al usuario.');
        }
    },
    deleteUser: async (req, res) => {
        try {
            const userEmail = req.params.email;
            await User.findOneAndDelete({ email: userEmail });
            await MailingService.sendAccountDeletedEmail(userEmail);
            res.redirect('/admin');
        } catch (error) {
            console.error(`Error en deleteUser: ${error}`);
            res.status(500).send('Ha ocurrido un error al eliminar al usuario.');
        }
    }



};

export default adminController;
