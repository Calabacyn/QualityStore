const request = require('supertest');
const app = require('../server');

describe('Suite de Pruebas para QualityStore API', () => {


    test('GET /api/status debe responder con ok', async () => {
        const res = await request(app).get('/api/status');
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe('ok');
    });


    test('GET /api/products debe traer una lista de productos', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);

        expect(res.body.length).toBeGreaterThan(0);
    });


    test('POST /api/auth/login debe autenticar al admin correctamente', async () => {
        const adminCredentials = {
            username: 'admin',
            password: '12345'
        };
        const res = await request(app)
            .post('/api/auth/login')
            .send(adminCredentials);

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBe('admin-token');
        expect(res.body.role).toBe('admin');
    });
});