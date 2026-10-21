const gridMotion = document.querySelector("[data-grid-motion]");

if (gridMotion) {
    const images = [
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=480&q=75",
        "https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=480&q=75",
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=480&q=75",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=480&q=75",
        "https://images.unsplash.com/photo-1705032033999-efa3082e1a4e?auto=format&fit=crop&w=480&q=75",
        "https://images.unsplash.com/photo-1721407964262-f9864b562453?auto=format&fit=crop&w=480&q=75"
    ];
    const plane = document.createElement("div");
    plane.className = "grid-motion__plane";

    for (let rowIndex = 0; rowIndex < 4; rowIndex += 1) {
        const row = document.createElement("div");
        row.className = "grid-motion__row";

        for (let tileIndex = 0; tileIndex < images.length * 2; tileIndex += 1) {
            const tile = document.createElement("div");
            const image = document.createElement("img");
            const imageIndex = (tileIndex + rowIndex * 2) % images.length;

            tile.className = "grid-motion__tile";
            image.src = images[imageIndex];
            image.alt = "";
            image.loading = "lazy";
            image.decoding = "async";
            tile.append(image);
            row.append(tile);
        }

        plane.append(row);
    }

    gridMotion.append(plane);

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        const tiles = [...gridMotion.querySelectorAll(".grid-motion__tile")];
        let frame = 0;
        let pointerX = 0;
        let pointerY = 0;

        gridMotion.addEventListener("pointermove", event => {
            pointerX = event.clientX;
            pointerY = event.clientY;
            if (frame) return;

            frame = window.requestAnimationFrame(() => {
                frame = 0;
                const bounds = gridMotion.getBoundingClientRect();
                const localX = pointerX - bounds.left;
                const localY = pointerY - bounds.top;

                tiles.forEach(tile => {
                    const tileBounds = tile.getBoundingClientRect();
                    const centerX = tileBounds.left - bounds.left + tileBounds.width / 2;
                    const centerY = tileBounds.top - bounds.top + tileBounds.height / 2;
                    const distance = Math.hypot(localX - centerX, localY - centerY);
                    const spotlight = Math.max(0, 1 - distance / 240);

                    tile.style.setProperty("--spot", spotlight.toFixed(2));
                });
            });
        }, { passive: true });

        gridMotion.addEventListener("pointerleave", () => {
            if (frame) {
                window.cancelAnimationFrame(frame);
                frame = 0;
            }

            tiles.forEach(tile => tile.style.removeProperty("--spot"));
        });
    }
}
