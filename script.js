
document.addEventListener("DOMContentLoaded", function () {

    // MOBILE NAVIGATION MENU
    const menuButton = document.getElementById("menu-btn");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll("#nav-menu a");

    menuButton.addEventListener("click", function () {
        const isOpen = navMenu.classList.toggle("open");

        menuButton.setAttribute("aria-expanded", String(isOpen));
        menuButton.textContent = isOpen ? "✕" : "☰";
    });

    // Close the menu when a link is clicked
    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {
            navMenu.classList.remove("open");
            menuButton.setAttribute("aria-expanded", "false");
            menuButton.textContent = "☰";
        });
    });

    // Close the menu when clicking outside
    document.addEventListener("click", function (event) {
        if (
            !navMenu.contains(event.target) &&
            !menuButton.contains(event.target)
        ) {
            navMenu.classList.remove("open");
            menuButton.setAttribute("aria-expanded", "false");
            menuButton.textContent = "☰";
        }
    });

    // AUTOMATIC COPYRIGHT YEAR
    document.getElementById("year").textContent =
        new Date().getFullYear();

    // HIGHLIGHT THE CURRENT NAVIGATION LINK
    const sections = document.querySelectorAll("main section[id]");

    function updateNavigation() {
        let currentSection = "home";

        sections.forEach(function (section) {
            if (window.scrollY >= section.offsetTop - 150) {
                currentSection = section.id;
            }
        });

        navLinks.forEach(function (link) {
            const isActive =
                link.getAttribute("href") === "#" + currentSection;

            link.classList.toggle("active", isActive);
        });
    }

    window.addEventListener("scroll", updateNavigation, {
        passive: true
    });

    updateNavigation();

});