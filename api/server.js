const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const usersStore = [];
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
            products = products.filter(p =>
                p.title.toLowerCase().includes(query.toLowerCase()) ||
                p.category.toLowerCase().includes(query.toLowerCase())
            );
        }

        return products.map(normalizeProduct);
    } catch (error) {
        console.error('External API failed or timed out. Using fallback.', error.message);
        const mockData = JSON.parse(fs.readFileSync(MOCK_FILE_PATH, 'utf-8'));

        let products = mockData;
        if (query) {
            products = products.filter(p =>
                p.title.toLowerCase().includes(query.toLowerCase()) ||
                p.category.toLowerCase().includes(query.toLowerCase())
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

app.get('/api/products/search', async (req, res) => {
    const { q } = req.query;
    const products = await getProductsFromSource(q);
    res.json(products);
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const response = await axios.get(`https://fakestoreapi.com/products/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch product' });
    }
});



// Cart Endpoints
app.get('/api/carts', async (req, res) => {
    try {
        const response = await axios.get('https://fakestoreapi.com/carts');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch carts' });
    }
});

app.post('/api/carts', async (req, res) => {
    try {
        const response = await axios.post('https://fakestoreapi.com/carts', req.body);
        res.status(201).json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create cart' });
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


// Admin Support Endpoints
// En server.js
app.get('/api/users', async (req, res) => {
    try {
        // 1. Traemos los usuarios de la FakeStore
        const response = await axios.get('https://fakestoreapi.com/users');
        const apiUsers = response.data;

        // 2. Los combinamos con los que tenemos en memoria (los nuevos)
        // Ponemos los nuevos primero para que se vean arriba
        const allUsers = [...usersStore, ...apiUsers];

        res.json(allUsers);
    } catch (error) {
        // Si la API externa falla, al menos devolvemos los nuestros
        res.json(usersStore);
    }
});

// Arriba, donde están las importaciones


// RUTA DE REGISTRO (POST)


app.post('/api/users', async (req, res) => {
    try {
        // 1. Guardamos el usuario en nuestro array local (Memoria)
        const newUser = {
            ...req.body,
            id: usersStore.length + 100 // Le damos un ID alto para no chocar
        };
        usersStore.push(newUser);

        console.log("Usuario registrado en memoria:", newUser);

        // 2. Opcional: Avisar a FakeStore (aunque ellos no lo guarden)
        await axios.post('https://fakestoreapi.com/users', req.body);

        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Error al registrar' });
    }
});

// RUTA DE LOGIN (POST) - Actualízala para que busque en usersStore
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    // A. ¿Es el admin?
    if (username === 'admin' && password === '12345') {
        return res.json({ token: 'admin-token', username: 'admin', role: 'admin' });
    }

    // B. ¿Es un usuario recién registrado por nosotros?
    const localUser = usersStore.find(u => u.username === username && u.password === password);
    if (localUser) {
        return res.json({ token: 'fake-jwt-token-' + localUser.id, username: localUser.username, role: 'client' });
    }

    // C. Si no es ninguno, intentamos con la API externa
    try {
        const response = await axios.post('https://fakestoreapi.com/auth/login', { username, password });
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

app.delete('/api/products/:id', async (req, res) => {
    try {
        const response = await axios.delete(`https://fakestoreapi.com/products/${req.params.id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product' });
    }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
