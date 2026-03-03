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

const FAKE_STORE_URL = 'https://fakestoreapi.com/products';
const MOCK_FILE_PATH = path.join(__dirname, 'mock-products.json');

app.get('/api/status', (req, res) => res.json({ status: 'ok', time: new Date() }));


// Normalization function
const normalizeProduct = (product) => ({
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    category: product.category,
    description: product.description,
});


const getProductsFromSource = async (query = '') => {
    try {
        const response = await axios.get(FAKE_STORE_URL, { timeout: 5000 });
        let products = response.data;

        if (query) {
            const cleanQuery = query.toLowerCase().trim();
            products = products.filter(p =>
                p.title?.toLowerCase().includes(cleanQuery) ||
                p.category?.toLowerCase().includes(cleanQuery)
            );
        }
        return products.map(normalizeProduct);
    } catch (error) {
        console.error('External API fallback activated');
        const mockData = JSON.parse(fs.readFileSync(MOCK_FILE_PATH, 'utf-8'));
        let products = mockData;

        if (query) {
            const cleanQuery = query.toLowerCase().trim();
            products = products.filter(p =>
                p.title?.toLowerCase().includes(cleanQuery) ||
                p.category?.toLowerCase().includes(cleanQuery)
            );
        }
        return products.map(normalizeProduct);
    }
};

app.get('/api/products', async (req, res) => {
    try {
        const response = await axios.get(FAKE_STORE_URL);
        const apiProducts = response.data.map(normalizeProduct);

        const localIds = productsStore.map(p => p.id);
        const filteredApiProducts = apiProducts.filter(p => !localIds.includes(p.id));

        res.json([...productsStore, ...filteredApiProducts]);
    } catch (error) {
        res.json(productsStore);
    }
});

// 3. Actualiza el POST para guardar en memoria
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = {
            ...req.body,
            id: productsStore.length + 500 // ID alto para evitar choques
        };
        productsStore.push(newProduct); // GUARDADO EN MEMORIA

        // Avisamos a FakeStore por protocolo
        await axios.post('https://fakestoreapi.com/products', req.body);

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear producto' });
    }
});

// Búsqueda por ID con Fallback
app.get('/api/products/:id', async (req, res) => {
    try {
        const response = await axios.get(`${FAKE_STORE_URL}/${req.params.id}`, { timeout: 2000 });
        res.json(response.data);
    } catch (error) {

        const mockData = JSON.parse(fs.readFileSync(MOCK_FILE_PATH, 'utf-8'));
        const allProducts = [...productsStore, ...mockData];
        const product = allProducts.find(p => p.id == req.params.id);

        if (product) res.json(product);
        else res.status(404).json({ message: 'Producto no encontrado' });
    }
});

// Búsqueda General (Search)
app.get('/api/products/search', async (req, res) => {
    const { q } = req.query;

    const products = await getProductsFromSource(q);
    res.json(products);
});



// Cart Endpoints
// --- CARRITO: Con Fallback de Simulación ---
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

        console.log("Simulando creación de carrito (API externa offline)");
        res.status(201).json({
            id: Math.floor(Math.random() * 1000),
            userId: req.body.userId,
            date: new Date(),
            products: req.body.products
        });
    }
});

app.get('/api/carts/:id', async (req, res) => {
    try {
        const response = await axios.get(`https://fakestoreapi.com/carts/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch cart' });
    }
});

app.put('/api/carts/:id', async (req, res) => {
    try {
        const response = await axios.put(`https://fakestoreapi.com/carts/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update cart' });
    }
});

app.delete('/api/carts/:id', async (req, res) => {
    try {
        const response = await axios.delete(`https://fakestoreapi.com/carts/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete cart' });
    }
});



app.get('/api/users', async (req, res) => {
    try {
        const response = await axios.get('https://fakestoreapi.com/users', { timeout: 2000 });
        res.json([...usersStore, ...response.data]);
    } catch (error) {
        res.json(usersStore); // Al menos devolvemos el admin y el test user
    }
});






app.post('/api/users', async (req, res) => {
    try {

        const newUser = {
            ...req.body,
            id: usersStore.length + 100
        };
        usersStore.push(newUser);

        console.log("Usuario registrado en memoria:", newUser);


        await axios.post('https://fakestoreapi.com/users', req.body);

        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar' });
    }
});


app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (username === 'admin') {
        if (password === '12345') {
            return res.json({
                token: 'admin-token-' + Date.now(),
                username: 'admin',
                role: 'admin'
            });
        } else {
            return res.status(401).json({ message: 'Contraseña de admin incorrecta' });
        }
    }


    if (username === 'user_test') {
        if (password === 'password123') {
            return res.json({
                token: 'test-token-' + Date.now(),
                username: 'user_test',
                role: 'client'
            });
        } else {
            return res.status(401).json({ message: 'Contraseña de test incorrecta' });
        }
    }

    try {
        const response = await axios.post('https://fakestoreapi.com/auth/login', { username, password }, { timeout: 3000 });
        res.json({ token: response.data.token, username: username, role: 'client' });
    } catch (error) {
        res.status(401).json({ message: 'Credenciales inválidas' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const response = await axios.put(`https://fakestoreapi.com/users/${req.params.id}`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const response = await axios.delete(`https://fakestoreapi.com/users/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user' });
    }
});




app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    // Buscamos si ya existe en nuestro store local
    const index = productsStore.findIndex(p => p.id == id);

    if (index !== -1) {
        // Si ya estaba en nuestro store, lo actualizamos
        productsStore[index] = { ...productsStore[index], ...updatedData };
    } else {
        // Si no estaba (era de la API), lo agregamos al store local como "modificado"
        productsStore.push({ ...updatedData, id: parseInt(id) });
    }

    console.log(`Producto ${id} actualizado en memoria`);
    res.json(updatedData);
});

// DELETE Producto (Crítico para pruebas CRUD)
app.delete('/api/products/:id', async (req, res) => {
    try {
        // Intentamos avisar fuera, pero borramos localmente sí o sí
        const index = productsStore.findIndex(p => p.id == req.params.id);
        if (index !== -1) productsStore.splice(index, 1);

        await axios.delete(`${FAKE_STORE_URL}/${req.params.id}`, { timeout: 2000 });
        res.json({ message: 'Producto eliminado (Simulado/Real)' });
    } catch (error) {
        res.json({ message: 'Producto eliminado de memoria local' });
    }
});




if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;