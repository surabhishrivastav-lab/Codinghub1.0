const storySteps = [...document.querySelectorAll("[data-story-step]")];
const storyImages = [...document.querySelectorAll(".story-image")];
const storyProgress = document.querySelector(".story-progress");

if (storySteps.length && storyImages.length === storySteps.length && storyProgress) {
    const activateStep = activeIndex => {
        storySteps.forEach((step, index) => {
            const active = index === activeIndex;
            step.classList.toggle("is-active", active);
            step.setAttribute("aria-current", String(active));
            storyImages[index].classList.toggle("is-active", active);
            storyImages[index].setAttribute("aria-hidden", String(!active));
        });

        storyProgress.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(storySteps.length).padStart(2, "0")}`;
    };

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver(entries => {
            const centeredSteps = entries
                .filter(entry => entry.isIntersecting)
                .sort((first, second) => second.intersectionRatio - first.intersectionRatio);
            if (!centeredSteps.length) return;
            activateStep(Number(centeredSteps[0].target.dataset.storyStep));
        }, {
            rootMargin: "-38% 0px -38% 0px",
            threshold: [0, 0.25, 0.5, 0.75, 1]
        });

        storySteps.forEach(step => observer.observe(step));
    }
}
