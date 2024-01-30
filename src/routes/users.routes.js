import express from "express";
import usersController from '../controllers/usersController.js';
import upload from '../config/multerConfig.js';
import { authenticateToken } from "../middlewares/tokenValidity.js";
import { checkPremiumRole } from "../middlewares/checkRole.js";

const usersRoutes = express.Router();

// Usuarios Convencionales

usersRoutes.get('/profile', authenticateToken, usersController.getInformation); // Esta Es Mi Ruta /Current
usersRoutes.put('/profile/editInformation', authenticateToken, usersController.editInformation);

// Rutas De Archivos & Validaciones

usersRoutes.get('/profile/addFiles', authenticateToken, usersController.getFilesView);
usersRoutes.post('/profile/addFiles/add', authenticateToken, upload.fields([{ name: 'id' }, { name: 'domicilio' }, { name: 'estadoCuenta' }]), usersController.sendFiles);




// Rutas Premium

usersRoutes.get('/profile/premiumPanel', authenticateToken, checkPremiumRole, usersController.getPremiumPanel);
usersRoutes.post('/profile/premiumPanel/addProduct', authenticateToken, checkPremiumRole, usersController.postPremiumProduct);
usersRoutes.post('/profile/premiumPanel/deleteProduct/:code', authenticateToken, checkPremiumRole, usersController.deletePremiumProduct);

export default usersRoutes;

