import { __dirname } from '../utils.js';
import swaggerJsDoc from 'swagger-jsdoc';
import path from 'path';

const swaggerOptions = {

    definition: {

        openapi: "3.0.1",

        info: {

            title: "Documentacion API E-Commerce",

            version: "1.0.0",

            description: "Definición de endpoints para la API de comercio"

        },

    },

    apis: [`${path.join(__dirname, "/docs/**/*.yaml")}`],

};

export const swaggerSpecs = swaggerJsDoc(swaggerOptions);