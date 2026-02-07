document.addEventListener("DOMContentLoaded", () => {

    const totalEl = document.getElementById("cartTotal");

    function moneyToNumber(text) {
        return Number(String(text).replace(/[^\d.]/g, "")) || 0;
    }

    function setTotal(value) {
        if (totalEl) totalEl.textContent = value.toFixed(2);
    }
    
    async function postJson(url) {
        const r = await fetch(url, { method: "POST" });
        if (!r.ok) throw new Error("Request failed");
        return r.json();
    }

    function getRowById(id) {
        return document.querySelector(`.cart_item[data-product-id="${id}"]`);
    }
    
    document.querySelectorAll(".cart__item_remove").forEach(btn => {

        btn.addEventListener("click", async () => {
        const id = btn.dataset.productId;
        try {
            const response = await fetch(`/cart/remove/${id}`, {
            method: "POST"
            });
            if (response.ok) {
            location.reload();
            } else {
            alert("No se pudo eliminar el producto");
            }
        } catch (err) {
            console.error(err);
            alert("Error de conexión");
        }
        });
    });

    document.querySelectorAll(".cart__item_increase").forEach(btn => {
        btn.addEventListener("click", async () => {
        const id = btn.dataset.productId;
        const row = getRowById(id);
        if (!row) return;

        const qtyEl = row.querySelector("[data-qty]");
        const priceEl = row.querySelector("[data-price]");
        const price = moneyToNumber(priceEl.dataset.price);
        
        const oldQty = Number(qtyEl.value) || 0;
        const newQty = oldQty + 1;

        // optimistic UI
        qtyEl.value = newQty;
        setTotal(moneyToNumber(totalEl.textContent) + price);

        try {
            const data = await postJson(`/cart/increase/${id}`);
            qtyEl.value = data.quantity;
        } catch (e) {
            qtyEl.value = oldQty; // rollback
            setTotal(moneyToNumber(totalEl.textContent) - price);
            console.error(e);
        }
        });
    });

    document.querySelectorAll(".cart__item_decrease").forEach(btn => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.productId;
            const row = getRowById(id);
            if (!row) return;

            const qtyEl = row.querySelector("[data-qty]");
            const priceEl = row.querySelector("[data-price]");
            const price = moneyToNumber(priceEl.dataset.price);

            const oldQty = Number(qtyEl.value) || 0;
            const newQty = oldQty - 1;

            // optimistic UI
            if (newQty >= 0) {
                qtyEl.value = newQty;
                setTotal(moneyToNumber(totalEl.textContent) - price);
            }

            try {
                const data = await postJson(`/cart/decrease/${id}`);

                if (data.removed) {
                    // elimina visualmente el item y su separador vector
                    const vector = row.nextElementSibling;
                    row.remove();
                    if (vector && vector.classList.contains("vector")) vector.remove();
                    return;
                }

                qtyEl.value = data.quantity;
            } catch (e) {
                qtyEl.value = oldQty; // rollback
                setTotal(moneyToNumber(totalEl.textContent) + price);
                console.error(e);
            }
            });
    });


});
