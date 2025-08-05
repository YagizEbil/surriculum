// Theme management for SUrriculum
document.addEventListener('DOMContentLoaded', function() {
    // Determine the theme to use. If the user has previously chosen a
    // theme, use that. Otherwise detect the device preference and store
    // it for subsequent loads so the choice persists across sessions.
    let currentTheme = localStorage.getItem('theme');
    if (!currentTheme) {
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        currentTheme = prefersDark ? 'dark-theme' : 'light-theme';
        localStorage.setItem('theme', currentTheme);
    }

    // Apply the theme to the body
    document.body.className = currentTheme;

    // Function to toggle theme
    function toggleTheme() {
        const body = document.body;
        const currentTheme = body.className;
        const newTheme = currentTheme === 'light-theme' ? 'dark-theme' : 'light-theme';

        body.className = newTheme;
        localStorage.setItem('theme', newTheme);

        // Update button text
        const themeButton = document.getElementById('themeToggle');
        if (themeButton) {
            themeButton.innerHTML = newTheme === 'dark-theme' ? '☀️ Light' : '🌙 Dark';
        }

        // Dispatch custom event for theme change
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { theme: newTheme }
        }));
    }

    // Connect theme button
    const themeButton = document.getElementById('themeToggle');
    if (themeButton) {
        // Set initial button text
        themeButton.innerHTML = currentTheme === 'dark-theme' ? '☀️ Light' : '🌙 Dark';

        // Add click handler
        themeButton.addEventListener('click', toggleTheme);
    }

    // Listen for theme changes from other scripts
    window.addEventListener('themeChanged', function(event) {
        console.log('Theme changed to:', event.detail.theme);
    });
});
