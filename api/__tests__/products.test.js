const request = require('supertest');
const app = require('../server');

describe('Suite de Pruebas para QualityStore API', () => {

    test('GET /api/status debe responder con ok', async () => {
        const res = await request(app).get('/api/status');
        expect(res.statusCode).toBe(200);
    });

    test('GET /api/products debe manejar la respuesta correctamente', async () => {
        const res = await request(app).get('/api/products');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);


        console.log(`Productos recibidos: ${res.body.length}`);
    });

    test('POST /api/products debe permitir agregar un producto y recuperarlo', async () => {
        const nuevoProducto = { title: 'Test Item', price: 10.5, category: 'test' };

        await request(app).post('/api/products').send(nuevoProducto);

        const res = await request(app).get('/api/products');
        expect(res.body.length).toBeGreaterThan(0);

        const creado = res.body.find(p => p.title === 'Test Item');
        expect(creado).toBeDefined();
    });

    test('POST /api/auth/login debe autenticar al admin', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: 'admin', password: '12345' });
        expect(res.body.token).toBe('admin-token');
    });
});