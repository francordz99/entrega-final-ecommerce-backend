import { expect } from 'chai';
import { app } from '../app.js';
import supertest from 'supertest';
import { describe, it, before } from 'mocha';

const request = supertest(app);

describe('Users Routes', () => {
    let userToken;

    before(async () => {
        const res = await request.post('/login').send({
            email: 'premium@test.com',
            password: 'premium',
        });

        expect(res.status).to.equal(302);
        const cookies = res.headers['set-cookie'];
        const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
        userToken = tokenCookie.split('=')[1];
    });

    it('Deberia traer la informacion del usuario', async () => {
        const res = await request.get('/profile').set('Cookie', [`token=${userToken}`]);
        expect(res.status).to.equal(200);
    });


    it('Deberia editar la informacion del usuario', async () => {
        const userInfo = {
            nombre: 'NuevoNombre',
            apellido: 'NuevoApellido',
            edad: 25,
            celular: '123456789',
        };

        const res = await request.put('/profile/editInformation')
            .send(userInfo)
            .set('Cookie', [`token=${userToken}`]);

        expect(res.status).to.equal(200);
    });

    it('Deberia traer el panel premium', async () => {
        const res = await request.get('/profile/premiumPanel').set('Cookie', [`token=${userToken}`]);
        expect(res.status).to.equal(200);
    });

    it('Deberia agregar un producto premium', async () => {
        const productData = {
            title: 'Nuevo Producto',
            description: 'Descripción del producto',
            price: 19.99,
            thumbnail: 'url_imagen',
            code: 'ABC123',
            stock: 10,
            category: 'Electrónicos',
            owner: "premium@test.com",
        };
        const res = await request.post('/profile/premiumPanel/addProduct')
            .send(productData)
            .set('Cookie', [`token=${userToken}`]);
        expect(res.status).to.equal(200);
    });


    it('Deberia eliminar un producto premium', async () => {
        const existingProductCode = 'ABC123';
        const res = await request.post(`/profile/premiumPanel/deleteProduct/${existingProductCode}`)
            .set('Cookie', [`token=${userToken}`]);
        expect(res.status).to.equal(200);
    });

});

