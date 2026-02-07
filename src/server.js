import express from "express";

import { homeHandler, 
        categoryHandler, 
        productHandler, 
        addProductHandler, 
        cartHandler,
        checkoutHandler,
        orderHandler,
        removeProductHandler,
        increaseQtyHandler,
        decreaseQtyHandler,
        cartCountHandler
    } from "./handlers.js";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("assets"));


//Router
app.get("/", homeHandler);
app.get("/categories/:id", categoryHandler);
app.get("/products/:id", productHandler);
app.post("/cart/add/:id", addProductHandler);
app.get("/cart", cartHandler);
app.get("/api/cart/count", cartCountHandler);
app.get("/checkout", checkoutHandler);
app.post("/order", orderHandler);
app.post("/cart/remove/:id", removeProductHandler);
app.post("/cart/increase/:id", increaseQtyHandler);
app.post("/cart/decrease/:id", decreaseQtyHandler);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});