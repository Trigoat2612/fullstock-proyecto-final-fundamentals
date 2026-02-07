document.addEventListener("DOMContentLoaded", async () => {
    const badge = document.getElementById("cartBadge");
    if (!badge) return;

    async function refreshBadge() {
        try {
        const r = await fetch("/api/cart/count");
        if (!r.ok) return;
        const { count } = await r.json();

        badge.textContent = count;
        badge.hidden = !count || count <= 0;
        } catch {}
    }

    // al cargar
    await refreshBadge();

    // opcional: escucha evento global cuando agregas al carrito
    window.addEventListener("cart:updated", refreshBadge);

    // expone función por si la quieres llamar desde otro script
    window.refreshCartBadge = refreshBadge;
});
