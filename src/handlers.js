import { getCategories, getCart, saveCart, getOrder } from "./utils.js";

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
    cart.push(product);
    await saveCart(cart);
    res.redirect(303,"/");
}
export async function cartHandler(_req, res) {
    const cart = await getCart();
    const total = cart.reduce((accumulator, product) => {
        return accumulator + product.price;
    }, 0);
    res.render("cart", { cart, total });
}

export async function checkoutHandler(_req, res) {
    const cart = await getCart();
    const total = cart.reduce((accumulator, product) => {
        return accumulator + product.price;
    }, 0);
    res.render("checkout", { cart, total });
}

export async function orderHandler(_req, res) {
    const order = await getOrder();
    res.render("order", { order });
}
