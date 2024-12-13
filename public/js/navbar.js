const toggleVisibility = async (elements, displayStyle) => {
    await elements.forEach((element) => {
        element.style.display = displayStyle;
    });
};

const isLogged = async () => {
    const response = await fetch(`${API_URL_USER}/isLogged`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
    });

    const result = await response.json();

    const authLinks = document.querySelectorAll('.auth-links');
    const privateLinks = document.querySelectorAll('.private-links');

    if (response.ok && result.success) {
        await toggleVisibility(authLinks, 'none');
        await toggleVisibility(privateLinks, 'block');
    }
};


async function initNavbar() {
    await isLogged();
    const profileLink = document.getElementById('profile-link');
    const privateLink = document.getElementById('private-link');
    profileLink.addEventListener('click', async () => {
        await handleNavigation('/user/profile');
    })

    privateLink.addEventListener('click', async () => {
        await handleNavigation('/user/private');
    })
}

const logout = async () => {
    const response = await fetch(`${API_URL_USER}/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    const result = await response.json();

    if (response.ok && result.success) {
        localStorage.removeItem('token');
        alert('Logged out successfully');
        window.location.href = '/';
    } else {
        console.log(result);
        alert('Error during logout: '+ result.error.message);
    }
}

const logoutAllDevices = async () => {
    const response = await fetch(`${API_URL_USER}/two-factor-active`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
    });
    const result = await response.json();
    if(response.ok && result.success) {
        await fetch(`${API_URL_USER}/modal-qr`)
        .then(response => response.text())
        .then(data => {
            document.getElementById('modal-container').innerHTML = '';
            document.getElementById('modal-container').innerHTML = data;
            const myModal = new bootstrap.Modal(document.getElementById('qrcode'));
            myModal.show();
        });
    document.getElementById('verify-code-btn').addEventListener('click', async () => {
        const authCode = document.getElementById('auth-code').value;
        if (!authCode) {
            alert('2FA code is required.');
            return;
        }
        const response = await fetch(`${API_URL_USER}/logout-all`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ authCode }),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            localStorage.removeItem('token');
            alert('Logged out from all devices successfully');
            window.location.href = '/user/login';
        } else {
            alert('Error during logout from all devices: ' + result.error.message);
        }
    });
    }else {
        alert('2FA enable is required');
    }
    

}

async function handleNavigation(url) {
    if (verifyToken()) {
        window.location.href = url;
    } else {
        alert('You do not have permission to access this page.');
        window.location.href = '/';

    }
}


