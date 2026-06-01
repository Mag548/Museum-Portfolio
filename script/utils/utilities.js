const popup = document.querySelector(".popup");

window.toRadian = (angle) => angle * (Math.PI / 180);

window.setColors = (to) => {
    if (!colors[to]) return;
    const css = colors[to].css;
    Object.entries(css).forEach(([key, value]) => {
        document.documentElement.style.setProperty(`--${key}`, value);
    });
};

window.displayPopup = (customClass, message) => {
    if (!popup) return;
    popup.textContent = message;
    popup.className = `popup active ${customClass}`;
    setTimeout(() => {
        popup.className = "popup";
    }, 1500);
};

window.playAudio = () => null;
