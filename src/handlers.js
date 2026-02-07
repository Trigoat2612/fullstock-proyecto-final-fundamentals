import crypto from "crypto";
import { getCategories, 
        getCart, 
        saveCart, 
        getOrder,
        saveOrder,
        getNextOrderId } from "./utils.js";

export async function homeHandler(_req, res) {
    const categories = await getCategories();
    res.render("index", { categories: categories });
}

export async function categoryHandler(req, res) {
    const categories = await getCategories();
    const categoryId = Number(req.params.id);
    const category = categories.find((c) => c.id === categoryId);
    const products = category.products;
    res.render("category", { category, products });
}

export async function productHandler(req, res) {
    const categories = await getCategories();
    const productId = Number(req.params.id);
    let product = null;
    for (const category of categories) {
        product = category.products.find((p) => p.id === productId);
        if (product) break;
    }
    if (product) {
        res.render("product", { product });
    } else {
        res.status(404).send("Product not found");
    }
}

export async function addProductHandler(req, res) {
    const cart = await getCart();
    const categories = await getCategories();
    const productId = Number(req.params.id);
    let product = null;
    for (const category of categories) {
        product = category.products.find((p) => p.id === productId);
        if (product) break;
    }
    if (!product) return res.sendStatus(404);

    // Busca si ya está en carrito
    const existing = cart.find(p => Number(p.id) === productId);

    if (existing) {
        existing.quantity = (Number(existing.quantity) || 0) + 1;
    }else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            imagePath: product.imagePath,
            imageDescription: product.imageDescription,
            quantity: 1,
            });
    }

    await saveCart(cart);

    // Si es request AJAX, responde JSON (útil para actualizar badge sin recargar)
    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
        const count = cart.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
        return res.json({ ok: true, count });
    }

    res.redirect(303,"/");
}
export async function cartHandler(_req, res) {
    const cart = await getCart();
    const total = cart.reduce((accumulator, product) => {
        return accumulator + (product.price*product.quantity);
    }, 0);
    res.render("cart", { cart, total });
}

export async function removeProductHandler(req, res) {
    const cart = await getCart();
    const productId = Number(req.params.id);

    const newCart = cart.filter((p) => Number(p.id) !== productId);

    await saveCart(newCart);

    res.redirect(303, "/cart");
}

export async function increaseQtyHandler(req, res) {
    const cart = await getCart();
    const id = Number(req.params.id);

    const item = cart.find(p => Number(p.id) === id);
    if (!item) return res.sendStatus(404);

    item.quantity = (Number(item.quantity) || 0) + 1;

    await saveCart(cart);
    res.json({ quantity: item.quantity });
}

export async function decreaseQtyHandler(req, res) {
    const cart = await getCart();
    const id = Number(req.params.id);

    const idx = cart.findIndex(p => Number(p.id) === id);
    if (idx === -1) return res.sendStatus(404);

    const current = Number(cart[idx].quantity) || 0;
    const next = current - 1;

    if (next <= 0) {
        cart.splice(idx, 1);
        await saveCart(cart);
        return res.json({ quantity: 0, removed: true });
    }

    cart[idx].quantity = next;
    await saveCart(cart);
    res.json({ quantity: next });
}

export async function checkoutHandler(_req, res) {
    const cart = await getCart();
    const total = cart.reduce((accumulator, product) => {
        return accumulator + (product.price*product.quantity);
    }, 0);
    res.render("checkout", { cart, total });
}

export async function orderHandler(req, res) {
    const cart = await getCart();
    if (!cart.length) {
        return res.status(400).send("El carrito está vacío");
    }

    // datos del formulario
    const {
        email, name, lastname, company,
        address, city, country, state, zip, phone
    } = req.body;

    // total (backend manda)
    const total = cart.reduce((acc, p) => {
        const qty = Number(p.quantity) || 0;
        const price = Number(p.price) || 0;
        return acc + qty * price;
    }, 0);

    // snapshot de items (para que no cambie si luego cambia el catálogo)
    const items = cart.map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price) || 0,
        quantity: Number(p.quantity) || 0,
        imagePath: p.imagePath,
    }));

    const orders = await getOrder();

    const order = {
        id: getNextOrderId(orders),
        createdAt: new Date().toISOString(),
        customer: {
        email,
        name,
        lastname,
        company,
        address,
        city,
        country,
        state,
        zip,
        phone,
        },
        items,
        total,
    };

    
    orders.push(order);
    await saveOrder(orders);
    // vaciar carrito al confirmar
    await saveCart([]);
    res.render("order", { order });
}

export async function cartCountHandler(_req, res) {
    const cart = await getCart();
    const count = cart.reduce((acc, p) => acc + (Number(p.quantity) || 1), 0);
    res.json({ count });
}