const navigation = document.querySelector("#main-navigation");
const navigationToggle = document.querySelector(".nav-toggle");

if (navigation && navigationToggle) {
    const compactLayout = window.matchMedia("(max-width: 1100px)");

    const setNavigationOpen = isOpen => {
        navigation.hidden = !isOpen;
        navigationToggle.setAttribute("aria-expanded", String(isOpen));
        navigationToggle.setAttribute("aria-label", `${isOpen ? "Hide" : "Show"} navigation`);
        navigationToggle.querySelector(".nav-toggle-label").textContent = isOpen ? "Hide" : "Menu";
    };

    setNavigationOpen(false);
    navigationToggle.addEventListener("click", () => {
        setNavigationOpen(navigation.hidden);
    });

    const updateForLayout = () => setNavigationOpen(false);
    if (compactLayout.addEventListener) {
        compactLayout.addEventListener("change", updateForLayout);
    } else {
        compactLayout.addListener(updateForLayout);
    }
}
