import { expect } from 'chai';
import { app } from '../app.js';
import supertest from 'supertest';
import { describe, it, before } from 'mocha';

const request = supertest(app);

describe('Products Routes', () => {
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

    it('Deberia traer los productos', async () => {
        const res = await request.get('/products').set('Cookie', [`token=${userToken}`]);

        expect(res.status).to.equal(200);
    });

});
