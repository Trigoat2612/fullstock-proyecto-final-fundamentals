import path from "path";
import { fileURLToPath } from "node:url";
import { readFile, writeFile } from "node:fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getCategories() {
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

export async function getCart() {
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

export async function saveCart(content) {
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

export async function getOrder() {
    try {
        const content = await readFile(
        path.join(__dirname, "order.json"),
        "utf8",
        );
        return JSON.parse(content);
    } catch (error) {
        console.log(error.message);
        return null;
    }
}

export async function saveOrder(content) {
    try {
        await writeFile(
        path.join(__dirname, "order.json"),
        JSON.stringify(content,null,2),
        );
    } catch (error) {
        console.log(error.message);
        return null;
    }
}

export function getNextOrderId(orders) {
    if (!orders.length) return 1;

    const maxId = Math.max(...orders.map(o => Number(o.id) || 0));
    return maxId + 1;
}