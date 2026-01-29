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
//Router
app.get("/", homeHandler);
app.get("/categories/:id", categoryHandler);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});