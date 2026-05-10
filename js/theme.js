const THEME_KEY = 'movieactivity-theme';

const applyTheme = (theme) => {
    document.body.setAttribute('data-theme', theme);
    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.innerHTML = theme === 'dark' ? '☀️ Claro' : '🌙 Oscuro';
    }
};

const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
applyTheme(savedTheme);

document.getElementById('themeToggle')?.addEventListener('click', () => {
    const current = document.body.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
});
