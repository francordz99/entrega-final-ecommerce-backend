import { expect } from 'chai';
import { app } from '../app.js';
import supertest from 'supertest';
import { describe, it, before, after } from 'mocha';

const request = supertest(app);

describe('Cart Routes', () => {
    let userToken = '';

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

    it('Deberia agregar el producto al carrito', async () => {
        const productId = '6565436004c4558d576832d1';

        const res = await request
            .put(`/cart/addProductToCart/${productId}`)
            .set('Cookie', `token=${userToken}`);

        expect(res.status).to.equal(200);
    });

    it('Deberia traer los productos del carrito', async () => {
        const res = await request.get('/cart').set('Cookie', `token=${userToken}`);

        expect(res.status).to.equal(200);
    });

    it('Deberia editar la cantidad de determinado producto en el carrito', async () => {
        const productId = '6565436004c4558d576832d1';

        const res = await request
            .put(`/cart/editProductQuantity/${productId}`)
            .set('Cookie', `token=${userToken}`)
            .send({ quantity: 2 });

        expect(res.status).to.equal(200);
    });

    it('Deberia eliminar el producto del carrito', async () => {
        const productId = '6565436004c4558d576832d1';

        const res = await request
            .delete(`/cart/deleteProductFromCart/${productId}`)
            .set('Cookie', `token=${userToken}`);

        expect(res.status).to.equal(200);
    });

    it('Deberia no funcionar por enviarle datos de un carrito vacio', async () => {

        const res = await request
            .post('/cart/buyItems')
            .set('Cookie', `token=${userToken}`)

        expect(res.status).to.equal(404);
    });

    after(async () => {
    });
});
