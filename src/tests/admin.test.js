import { expect } from 'chai';
import { app } from '../app.js';
import { describe, it, before, after } from 'mocha';
import supertest from 'supertest';

const request = supertest(app);

describe('Rutas Administrativas', () => {
    let adminToken = '';

    before(async () => {
        const res = await request.post('/login').send({
            email: 'admin@test.com',
            password: 'admin',
        });

        expect(res.status).to.equal(302);
        const cookies = res.headers['set-cookie'];
        const tokenCookie = cookies.find(cookie => cookie.startsWith('token='));
        adminToken = tokenCookie.split('=')[1];
    });


    it('Debe llevarte a la pagina de administrador', async () => {
        const res = await request.get('/admin').set('Cookie', `token=${adminToken}`);

        expect(res.status).to.equal(200);
    });

    it('Muestra informacion de un producto por codigo', async () => {
        const res = await request.get('/admin/getProduct').set('Cookie', `token=${adminToken}`).query({ code: 'EX2001' });

        expect(res.status).to.equal(200);
    });

    it('Agregar un producto', async () => {
        const res = await request.post('/admin/addProduct').set('Cookie', `token=${adminToken}`).send({
            title: 'New Product',
            description: 'Product Description',
            price: 20,
            thumbnail: 'product-image.jpg',
            code: 'newProductCode',
            stock: 50,
            category: 'Electronics',
        });

        expect(res.status).to.equal(200);
    });

    it('Editar un producto existente', async () => {
        const res = await request.put('/admin/editProduct').set('Cookie', `token=${adminToken}`).send({
            code: 'newProductCode',
            title: 'Updated Product',
            description: 'Updated Product Description',
            price: 25,
            thumbnail: 'updated-image.jpg',
            stock: 60,
            category: 'Updated Category',
        });

        expect(res.status).to.equal(200);
    });

    it('Eliminar un producto por codigo', async () => {
        const res = await request.delete('/admin/deleteProduct').set('Cookie', `token=${adminToken}`).send({
            code: 'newProductCode',
        });

        expect(res.status).to.equal(200);
    });

    it('Debe editar el rango del usuario', async () => {
        const res = await request.put('/admin/editPermissions').set('Cookie', `token=${adminToken}`).send({
            email: 'usuario@test.com',
            permissionLevel: 'user',
        });

        expect(res.status).to.equal(200);
    });
    after(async () => {
    });
});
