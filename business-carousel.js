const carousel = document.querySelector(".gallery-carousel");

if (carousel) {
    const stage = carousel.querySelector(".gallery-stage");
    const track = carousel.querySelector(".gallery-track");
    const cards = [...carousel.querySelectorAll(".gallery-card")];
    const caption = carousel.querySelector(".gallery-caption strong");
    const counter = carousel.querySelector(".gallery-caption span");
    const indicators = carousel.querySelector(".gallery-indicators");
    const previousButton = carousel.querySelector(".gallery-previous");
    const nextButton = carousel.querySelector(".gallery-next");
    const toggleButton = carousel.querySelector(".gallery-toggle");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const visibleCards = Math.min(4, cards.length);

    let activeIndex = 0;
    let pointerStart = null;
    let timer = null;
    let visible = false;
    let hovering = false;
    let focused = false;
    let userPaused = reducedMotion.matches;

    const indicatorButtons = cards.map((card, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.setAttribute("aria-label", `Show gallery image ${index + 1}: ${card.querySelector("figcaption strong").textContent}`);
        button.addEventListener("click", () => setActive(index));
        indicators.append(button);
        return button;
    });

    const setActive = index => {
        activeIndex = (index + cards.length) % cards.length;
        const width = carousel.clientWidth;
        const direction = getComputedStyle(document.documentElement).direction === "rtl" ? -1 : 1;

        cards.forEach((card, cardIndex) => {
            let offset = cardIndex - activeIndex;
            if (offset > cards.length / 2) offset -= cards.length;
            if (offset < -cards.length / 2) offset += cards.length;

            const depth = Math.abs(offset);
            const isVisible = depth < visibleCards;
            const spread = Math.min(72, Math.max(28, width * 0.11));
            const x = offset * spread * direction;
            const z = -depth * 76;
            const tilt = offset * -12 * direction;
            const scale = 1 - depth * 0.075;
            const brightness = Math.max(0.4, 1 - depth * 0.14);
            const blur = Math.min(4, depth * 0.9);

            card.style.setProperty("--card-x", `${x}px`);
            card.style.setProperty("--card-z", `${z}px`);
            card.style.setProperty("--card-tilt", `${tilt}deg`);
            card.style.setProperty("--card-scale", String(scale));
            card.style.setProperty("--card-brightness", String(brightness));
            card.style.setProperty("--card-blur", `${blur}px`);
            card.style.zIndex = String(cards.length - depth);
            card.setAttribute("aria-hidden", String(!isVisible));
            card.inert = !isVisible;
        });

        caption.textContent = cards[activeIndex].querySelector("figcaption strong").textContent;
        counter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
        indicatorButtons.forEach((button, index) => {
            const current = index === activeIndex;
            button.setAttribute("aria-current", String(current));
        });
    };

    const resize = () => {
        const width = carousel.clientWidth;
        const cardWidth = Math.min(288, Math.max(174, width * 0.39));
        const cardHeight = cardWidth * 1.24;
        carousel.style.setProperty("--gallery-card-width", `${cardWidth}px`);
        carousel.style.setProperty("--gallery-card-height", `${cardHeight}px`);
        setActive(activeIndex);
    };

    const stopAutoplay = () => {
        if (timer !== null) {
            window.clearInterval(timer);
            timer = null;
        }
    };

    const updateAutoplay = () => {
        const shouldPlay = visible && !userPaused && !hovering && !focused && !document.hidden;
        if (shouldPlay && timer === null) {
            timer = window.setInterval(() => setActive(activeIndex + 1), 5000);
        } else if (!shouldPlay) {
            stopAutoplay();
        }

        toggleButton.textContent = userPaused ? "Resume" : "Pause";
        toggleButton.setAttribute("aria-pressed", String(userPaused));
        toggleButton.setAttribute("aria-label", userPaused ? "Resume gallery rotation" : "Pause gallery rotation");
    };

    const finishDrag = event => {
        if (!pointerStart || pointerStart.pointerId !== event.pointerId) return;
        const delta = event.clientX - pointerStart.x;
        if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
        pointerStart = null;
        carousel.classList.remove("is-dragging");

        if (Math.abs(delta) > 35) {
            const direction = getComputedStyle(document.documentElement).direction === "rtl" ? -1 : 1;
            setActive(activeIndex + (delta * direction < 0 ? 1 : -1));
        }
    };

    previousButton.addEventListener("click", () => setActive(activeIndex - 1));
    nextButton.addEventListener("click", () => setActive(activeIndex + 1));
    toggleButton.addEventListener("click", () => {
        userPaused = !userPaused;
        updateAutoplay();
    });

    carousel.addEventListener("keydown", event => {
        if (event.key === "ArrowLeft") {
            event.preventDefault();
            setActive(activeIndex - 1);
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            setActive(activeIndex + 1);
        } else if (event.key === "Home") {
            event.preventDefault();
            setActive(0);
        } else if (event.key === "End") {
            event.preventDefault();
            setActive(cards.length - 1);
        }
    });

    carousel.addEventListener("pointerenter", () => {
        hovering = true;
        updateAutoplay();
    });
    carousel.addEventListener("pointerleave", () => {
        hovering = false;
        updateAutoplay();
    });
    carousel.addEventListener("focusin", () => {
        focused = true;
        updateAutoplay();
    });
    carousel.addEventListener("focusout", event => {
        if (!carousel.contains(event.relatedTarget)) {
            focused = false;
            updateAutoplay();
        }
    });

    stage.addEventListener("pointerdown", event => {
        if (event.button !== 0 && event.pointerType === "mouse") return;
        pointerStart = { x: event.clientX, pointerId: event.pointerId };
        carousel.classList.add("is-dragging");
        stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener("pointerup", finishDrag);
    stage.addEventListener("pointercancel", finishDrag);
    stage.addEventListener("lostpointercapture", finishDrag);

    const updateMotionPreference = () => {
        if (reducedMotion.matches) userPaused = true;
        updateAutoplay();
    };

    if (reducedMotion.addEventListener) {
        reducedMotion.addEventListener("change", updateMotionPreference);
    } else {
        reducedMotion.addListener(updateMotionPreference);
    }

    document.addEventListener("visibilitychange", updateAutoplay);
    if ("ResizeObserver" in window) {
        new ResizeObserver(resize).observe(carousel);
    } else {
        window.addEventListener("resize", resize);
    }

    if ("IntersectionObserver" in window) {
        new IntersectionObserver(entries => {
            visible = entries.some(entry => entry.isIntersecting);
            updateAutoplay();
        }).observe(carousel);
    } else {
        visible = true;
    }

    resize();
    setActive(0);
    carousel.classList.add("is-ready");
    updateAutoplay();
}
