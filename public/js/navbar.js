const toggleVisibility = (elements, displayStyle) => {
    elements.forEach((element) => {
        element.style.display = displayStyle;
    });
};

const isLogged = async () => {
    const response = await fetch(`${API_URL_USER}/isLogged`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
    });

    const result = await response.json();

    const authLinks = document.querySelectorAll('.auth-links');
    const privateLinks = document.querySelectorAll('.private-links');

    if (response.ok && result.success) {
        toggleVisibility(authLinks, 'none');
        toggleVisibility(privateLinks, 'block');
    }
};

isLogged();