import express from 'express';
import adminController from '../controllers/adminController.js';
import { authenticateToken } from "../middlewares/tokenValidity.js";
import { checkAdminRole } from '../middlewares/checkRole.js';

const adminRoutes = express.Router();

// Traer La Vista ✔️

adminRoutes.get('/admin', authenticateToken, checkAdminRole, adminController.getAdmin);

// Rutas Para CRUD ✔️

adminRoutes.get('/admin/getProduct', authenticateToken, checkAdminRole, adminController.getProduct);
adminRoutes.post('/admin/addProduct', authenticateToken, checkAdminRole, adminController.postProduct);
adminRoutes.put('/admin/editProduct', authenticateToken, checkAdminRole, adminController.putProduct);
adminRoutes.delete('/admin/deleteProduct', authenticateToken, checkAdminRole, adminController.deleteProduct);

// Rutas Para Gestionar Rol De Usuario ✔️

adminRoutes.post('/admin/editPermissions/checkDocuments', authenticateToken, checkAdminRole, adminController.checkDocuments);
adminRoutes.put('/admin/editPermissions', authenticateToken, checkAdminRole, adminController.editPermissions);

// Rutas Para Eliminar Y Ver Usuarios

adminRoutes.get('/admin/getAllUsers', authenticateToken, checkAdminRole, adminController.getAllUsers);
adminRoutes.post('/admin/deleteInactive', authenticateToken, checkAdminRole, adminController.deleteInactive);
adminRoutes.post('/admin/findUser', authenticateToken, checkAdminRole, adminController.findUser);
adminRoutes.delete('/admin/deleteUser/:email', authenticateToken, checkAdminRole, adminController.deleteUser);


export default adminRoutes;

