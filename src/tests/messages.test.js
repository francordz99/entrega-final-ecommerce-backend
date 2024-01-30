import { expect } from 'chai';
import { app } from '../app.js';
import supertest from 'supertest';
import { describe, it, before } from 'mocha';

const request = supertest(app);

describe('Messages Routes', () => {
    let userToken;

    before(async () => {
        const res = await request.post('/login').send({
            email: 'usuario@test.com',
            password: 'usuario',
        });

        expect(res.status).to.equal(302);
        const cookies = res.headers['set-cookie'];
        const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
        userToken = tokenCookie.split('=')[1];
    });


    it('Tiene que traer todos los mensajes', async () => {
        const res = await request.get('/chat').set('Cookie', [`token=${userToken}`]);
        expect(res.status).to.equal(200);
    });



    it('Deberia postear un nuevo mensaje', async () => {
        const messageData = {
            nick: 'Unidad',
            contenido: 'Hola, esto es un mensaje de prueba.',
        };

        const res = await request.post('/chat/send').send(messageData).set('Cookie', [`token=${userToken}`]);

        expect(res.status).to.equal(200);

    });

});
