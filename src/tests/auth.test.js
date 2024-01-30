import { expect } from 'chai';
import supertest from 'supertest';
import { app } from '../app.js';
import { describe, it } from 'mocha';

const request = supertest(app);

describe('Auth API Tests', () => {

    it('Tiene que registrar un usuario nuevo', async () => {
        const response = await request.post('/register').send({
            nombre: 'Testeador',
            apellido: 'UserGen',
            sexo: 'masculino',
            edad: 25,
            email: 'testuser@example.com',
            celular: '123456789',
            password: 'testpassword'
        });

        expect(response.status).to.equal(302);
    });

    it('Debe logear al usuario que acabo de crear', async () => {
        const response = await request.post('/login').send({
            email: 'testuser@example.com',
            password: 'testpassword'
        });

        expect(response.status).to.equal(302);
    });

    it('No deberia logear al usuario por usar mal la contraseña', async () => {
        const res = await request.post('/login').send({
            email: 'testuser@example.com',
            password: 'wrongpassword',
        });

        expect(res.status).to.equal(500);
    });

    it('Debe hacer el paso uno para recuperar contraseña', async () => {
        const res = await request.post('/resetPassword').send({
            email: 'test@example.com',
        });

        expect(res.status).to.equal(200);
        // Agrega más expectativas según sea necesario
    });

    // NOTA IMPORTANTE : Revisar que el usuario no se haya creado previamente , si existe poner otra informacion en el it que contiene el registro o borrar el existente en la DB.
    // NOTA IMPORTANTE 2 : El segundo paso del reset de contraseña no puede ser testeado debido a que hay una verificacion por email de por medio.

});

