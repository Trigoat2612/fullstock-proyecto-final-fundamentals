import express from "express";
import path from "path";
import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("assets"));

async function readJson() {
    try {
        const content = await readFile(
        path.join(__dirname, "categories.json"),
        "utf8",
        );
        return JSON.parse(content);
    } catch (error) {
        console.log(error.message);
        return null;
    }
}

async function getCart() {
    try {
        const content = await readFile(
        path.join(__dirname, "cart.json"),
        "utf8",
        );
        return JSON.parse(content);
    } catch (error) {
        console.log(error.message);
        return null;
    }
}

async function saveCart(content) {
    try {
        await writeFile(
        path.join(__dirname, "cart.json"),
        JSON.stringify(content,null,2),
        );
    } catch (error) {
        console.log(error.message);
        return null;
    }
}

//Handlers
async function homeHandler(_req, res) {
    const categories = await readJson();
    res.render("index", { categories: categories });
}

async function categoryHandler(req, res) {
    const categories = await readJson();
    const categoryId = Number(req.params.id);
    const category = categories.find((c) => c.id === categoryId);
    const products = category.products;
    res.render("category", { category, products });
}

async function productHandler(req, res) {
    const categories = await readJson();
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

async function addProductHandler(req, res) {
    const cart = await getCart();
    const categories = await readJson();
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
//Router
app.get("/", homeHandler);
app.get("/categories/:id", categoryHandler);
app.get("/products/:id", productHandler);
app.post("/cart/add/:id", addProductHandler);
//app.get("/cart", cartHandler);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});