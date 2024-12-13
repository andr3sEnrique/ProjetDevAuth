const API_URL_USER = 'http://localhost:3000/user';
const API_URL_BLOG = 'http://localhost:3000/blog';
const token = localStorage.getItem('token');
function displayErrors(container, errors) {
    const errorsHTML = errors.map(error => `<li class="text-danger">${error}</li>`).join('');
    container.innerHTML = errorsHTML;
}

function noBlogs(container, html) {
    container.innerHTML = html;
}


function displaySuccess(container, message) {
    container.innerHTML = `<li class="text-success">${message}</li>`;
}

const verifyToken = async () => {
    const response = await fetch(`${API_URL_USER}/verifierToken`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) return false
    return true
}

async function handleNavigation(url) {
    if (await verifyToken()) {
        window.location.href = url;
    } else {
        alert('You do not have permission to access this page.');
        window.location.href = '/';
    }
}