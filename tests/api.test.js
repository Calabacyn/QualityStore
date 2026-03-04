const request = require('supertest');
const app = require('../api/server');

describe('QualityStore API Tests', () => {
    test('GET /api/products should return 200 and a list of products', async () => {
        const response = await request(app).get('/api/products');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);

        const product = response.body[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('title');
        expect(product).toHaveProperty('price');
        expect(product).toHaveProperty('image');
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('description');
    });

    test('GET /api/products/search should filter products correctly', async () => {
        const response = await request(app).get('/api/products/search?q=men');
        expect(response.status).toBe(200);
        expect(response.body.every(p =>
            p.title.toLowerCase().includes('men') ||
            p.category.toLowerCase().includes('men')
        )).toBe(true);
    });

    test('Response time should be less than 500ms', async () => {
        const start = Date.now();
        await request(app).get('/api/products');
        const duration = Date.now() - start;
        expect(duration).toBeLessThan(500);
    });
});
