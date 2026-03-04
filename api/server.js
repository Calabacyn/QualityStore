const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const usersStore = [
    {
        id: 999,
        username: 'user_test',
        password: 'password123',
        role: 'client'
    }
];
const productsStore = [];

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(`📢 PETICIÓN RECIBIDA: ${req.method} ${req.url}`);
    next();
});

app.get('/debug', (req, res) => {
    res.send("EL SERVIDOR 3009 ESTÁ RESPONDIENDO");
});

const FAKE_STORE_URL = 'https://fakestoreapi.com/products';
const MOCK_FILE_PATH = path.join(__dirname, 'mock-products.json');

app.get('/api/status', (req, res) => res.json({ status: 'ok', time: new Date() }));

const normalizeProduct = (product) => ({
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    category: product.category,
    description: product.description,
});

const getProductsFromSource = async (query = '') => {
    const normalizedQuery = query.toLowerCase().trim();
    try {
        const response = await axios.get(FAKE_STORE_URL, { timeout: 2000 });
        let products = response.data;

        if (normalizedQuery) {
            products = products.filter(p =>
                p.title.toLowerCase().includes(normalizedQuery) ||
                p.category.toLowerCase().includes(normalizedQuery)
            );
        }

        return products.map(normalizeProduct);
    } catch (error) {
        console.error('External API failed or timed out. Using fallback.', error.message);
        try {
            if (fs.existsSync(MOCK_FILE_PATH)) {
                const mockData = JSON.parse(fs.readFileSync(MOCK_FILE_PATH, 'utf-8'));
                let products = mockData.map(p => ({ ...p, id: p.id + 500 }));

                if (normalizedQuery) {
                    products = products.filter(p =>
                        p.title.toLowerCase().includes(normalizedQuery) ||
                        p.category.toLowerCase().includes(normalizedQuery)
                    );
                }
                return products.map(normalizeProduct);
            }
            return [];
        } catch (readError) {
            console.error('Failed to read mock-products.json', readError.message);
            return [];
        }
    }
};

app.get('/api/products', async (req, res) => {
    try {
        const sourceProducts = await getProductsFromSource();
        res.json([...productsStore, ...sourceProducts]);
    } catch (error) {
        res.json(productsStore);
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = {
            ...req.body,
            id: Date.now()
        };
        productsStore.push(newProduct);
        console.log("Producto creado localmente:", newProduct.id);

        axios.post(FAKE_STORE_URL, req.body, { timeout: 1000 }).catch(() => { });

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear producto' });
    }
});

app.get('/api/products/search', async (req, res) => {
    console.log(`\n--- INICIO BÚSQUEDA ---`);
    try {
        const { q } = req.query;
        console.log(`1. Query recibido: "${q}"`);

        const clean = (str) => String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const queryClean = clean(q);
        console.log(`2. Query normalizado: "${queryClean}"`);

        const filePath = path.join(__dirname, 'mock-products.json');

        if (!fs.existsSync(filePath)) {
            console.error("4. ❌ ERROR: El archivo NO existe");
            return res.status(200).json([]);
        }

        const rawData = fs.readFileSync(filePath, 'utf-8');
        const allProducts = JSON.parse(rawData);

        const combined = [...productsStore, ...allProducts];
        console.log(`5. Total productos para filtrar: ${combined.length}`);

        const results = combined.filter(p => {
            const t = clean(p.title);
            const c = clean(p.category);
            return t.includes(queryClean) || c.includes(queryClean);
        });

        console.log(`6. ✅ Coincidencias finales: ${results.length}`);
        return res.json(results);

    } catch (error) {
        console.error("❌ ERROR CRÍTICO EN EL CÓDIGO:", error.message);
        return res.status(500).json({ error: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const localProduct = productsStore.find(p => p.id == req.params.id);
        if (localProduct) return res.json(localProduct);

        try {
            const response = await axios.get(`${FAKE_STORE_URL}/${req.params.id}`, { timeout: 2000 });
            return res.json(response.data);
        } catch (apiError) {
            const mockData = JSON.parse(fs.readFileSync(MOCK_FILE_PATH, 'utf-8'));
            const mockProduct = mockData.find(p => (p.id + 500) == req.params.id || p.id == req.params.id);

            if (mockProduct) return res.json({ ...mockProduct, id: mockProduct.id + 500 });
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/api/products/:id', (req, res) => {
    try {
        const { id } = req.params;
        const index = productsStore.findIndex(p => p.id == id);

        if (index !== -1) {
            productsStore[index] = { ...productsStore[index], ...req.body };
            res.json(productsStore[index]);
        } else {
            const updatedProduct = { ...req.body, id: parseInt(id) };
            productsStore.push(updatedProduct);
            res.json(updatedProduct);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar producto' });
    }
});

app.delete('/api/products/:id', (req, res) => {
    try {
        const index = productsStore.findIndex(p => p.id == req.params.id);
        if (index !== -1) {
            productsStore.splice(index, 1);
        }
        res.json({ message: 'Producto eliminado de memoria local' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar producto' });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        let externalUsers = [];
        try {
            const response = await axios.get('https://fakestoreapi.com/users', { timeout: 2000 });
            externalUsers = response.data;
        } catch (e) {
            console.log("External users API unavailable");
        }
        res.json([...usersStore, ...externalUsers]);
    } catch (error) {
        res.json(usersStore);
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const newUser = {
            ...req.body,
            id: Date.now(),
            role: req.body.role || 'client'
        };
        usersStore.push(newUser);
        console.log("Usuario registrado localmente:", newUser.username);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar usuario' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (username === 'admin' && password === '12345') {
            return res.json({ token: 'admin-token', username: 'admin', role: 'admin' });
        }
        if (username === 'user_test' && password === 'password123') {
            return res.json({ token: 'user-test-token', username: 'user_test', role: 'client' });
        }

        const localUser = usersStore.find(u => u.username === username && u.password === password);
        if (localUser) {
            return res.json({
                token: 'local-jwt-' + localUser.id,
                username: localUser.username,
                role: localUser.role || 'client'
            });
        }

        try {
            const response = await axios.post('https://fakestoreapi.com/auth/login', { username, password }, { timeout: 2000 });
            return res.json({ token: response.data.token, username: username, role: 'client' });
        } catch (apiError) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error interno en login' });
    }
});

app.get('/api/carts', async (req, res) => {
    try {
        const response = await axios.get('https://fakestoreapi.com/carts', { timeout: 2000 });
        res.json(response.data);
    } catch (error) {
        res.json([]);
    }
});

app.post('/api/carts', async (req, res) => {
    try {
        const response = await axios.post('https://fakestoreapi.com/carts', req.body, { timeout: 2000 });
        res.status(201).json(response.data);
    } catch (error) {
        console.log("Simulando creación de carrito (Offline)");
        res.status(201).json({
            id: Math.floor(Math.random() * 9999) + 1000,
            userId: req.body.userId || 1,
            date: new Date(),
            products: req.body.products || []
        });
    }
});

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;