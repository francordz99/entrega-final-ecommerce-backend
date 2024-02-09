import { transporter } from "../config/nodemailerConfig.js";
import { config } from "../config/dotenvConfig.js";
import { __dirname } from "../utils.js";
import jwt from "jsonwebtoken";
import path from 'path';
import { mailingErrors } from './errors/mailingErrors.js';
import { logger } from "../helpers/loggerConfig.js";

const MailingService = {
    sendPurchaseConfirmation: async (userEmail, ticketCode) => {
        try {
            const result = await transporter.sendMail({
                from: config.nodemailer.gmaccount,
                to: userEmail,
                subject: "Compra Exitosa - E-Commerce TurboCenter",
                html: `<p>Gracias por tu compra. Tu código de ticket es: ${ticketCode}</p>
                    <img src="cid:success">`,
                attachments: [
                    {
                        filename: "success.png",
                        path: path.join(__dirname, "/assets/images/success.png"),
                        cid: "success"
                    },
                    {
                        filename: "terms.txt",
                        path: path.join(__dirname, "/assets/documents/terms.txt"),
                        cid: "terms"
                    }
                ]
            });

            return { success: true, result };
        } catch (error) {
            logger.error('Error al enviar el correo:', error);
            mailingErrors.sendPurchaseConfirmationError(error);
            return { success: false, error: 'Hubo un error al enviar el correo' };
        }
    },
    generateEmailToken: async (email, expires) => {
        const token = jwt.sign({ email }, config.nodemailer.gmrecoverytoken, { expiresIn: expires });
        return token;
    },
    sendRecoveryEmail: async (req, userEmail, token) => {
        const domain = `${req.protocol}://${req.get('host')}`;
        const link = `${domain}/resetPasswordStepTwo?token=${token}`
        await transporter.sendMail({
            from: "E-Commerce TurboCenter",
            to: userEmail,
            subject: "Reestablece Tu Contraseña",
            html: `<div>
            <p>Solicitaste reestablecer la contraseña , para hacerlo haz click <a href="${link}">aquí</a></p>
            </div>`
        });
    },
    sendProductDeletedEmail: async (userEmail, productInfo) => {
        try {
            const { title, description, price, thumbnail, code, stock, category } = productInfo;

            const result = await transporter.sendMail({
                from: config.nodemailer.gmaccount,
                to: userEmail,
                subject: "Producto Eliminado - E-Commerce TurboCenter",
                html: `
                    <p>Estimado usuario premium,</p>
                    <p>Le informamos que el siguiente producto ha sido eliminado de nuestra plataforma:</p>
                    <ul>
                        <li><strong>Título:</strong> ${title}</li>
                        <li><strong>Descripción:</strong> ${description}</li>
                        <li><strong>Precio:</strong> ${price}</li>
                        <li><strong>Imagen:</strong> <img src="${thumbnail}" alt="Thumbnail"></li>
                        <li><strong>Código:</strong> ${code}</li>
                        <li><strong>Stock:</strong> ${stock}</li>
                        <li><strong>Categoría:</strong> ${category}</li>
                    </ul>
                    <p>Lamentamos los inconvenientes. Si necesita más información, no dude en contactarnos.</p>
                `,
            });

            return { success: true, result };
        } catch (error) {
            logger.error('Error al enviar el correo electrónico al usuario premium:', error);
            return { success: false, error: 'Hubo un error al enviar el correo electrónico al usuario premium' };
        }
    },
    sendAccountDeletedEmail: async (userEmail) => {
        try {
            const result = await transporter.sendMail({
                from: config.nodemailer.gmaccount,
                to: userEmail,
                subject: "Cuenta Eliminada - E-Commerce TurboCenter",
                html: `
                    <p>Estimado usuario,</p>
                    <p>Le informamos que su cuenta ha sido eliminada de nuestra plataforma.</p>
                    <p>Si tiene alguna pregunta o necesita más información, no dude en contactarnos.</p>
                `,
            });

            return { success: true, result };
        } catch (error) {
            logger.error('Error al enviar el correo electrónico de cuenta eliminada:', error);
            return { success: false, error: 'Hubo un error al enviar el correo electrónico de cuenta eliminada' };
        }
    },
    sendAccountDeletedInactiveEmail: async (userEmail) => {
        try {
            const result = await transporter.sendMail({
                from: config.nodemailer.gmaccount,
                to: userEmail,
                subject: "Cuenta Eliminada por Inactividad - E-Commerce TurboCenter",
                html: `
                    <p>Estimado usuario,</p>
                    <p>Le informamos que su cuenta ha sido eliminada de nuestra plataforma debido a la inactividad.</p>
                    <p>Si necesita más información o desea reactivar su cuenta, no dude en contactarnos.</p>
                `,
            });

            return { success: true, result };
        } catch (error) {
            logger.error('Error al enviar el correo electrónico de cuenta eliminada por inactividad:', error);
            return { success: false, error: 'Hubo un error al enviar el correo electrónico de cuenta eliminada por inactividad' };
        }
    }
};

export default MailingService;
