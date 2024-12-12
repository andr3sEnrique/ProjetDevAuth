const form = document.querySelector("form");
const errorsContainer = document.getElementById('errors');
const successContainer = document.getElementById('success');
const API_URL_USER = 'http://localhost:3000/user'

function isEmailValid(email) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
}

const isValidUser = (user) => {
    let errors = [];

    if(user.password.length < 8) {
        errors.push('Password must contains 8 characters');
    }

    if(!isEmailValid(user.username)) {
        errors.push('Username should be a valid email');
    }

    if (errors.length >= 1) {
        let errorsHTML = '';
        errors.forEach(error => {
            errorsHTML += `<li class="text-danger">${error}</li>`
        })
        errorsContainer.innerHTML = errorsHTML;
        return false;
    }

    errorsContainer.innerHTML = '';
    return true;
}

async function makePostRequest(url, bodyData) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyData,
        credentials: 'include',
    });
    return await response.json();
}

function handleResponse(result, option) {
    if (result.success) {
        successContainer.innerHTML = `<li class="text-success">${option} successfully</li>`;
        errorsContainer.innerHTML = '';
        form.reset();

        if (option === 'login') {
            window.location.href = '/';
        } else if (option === 'register') {
            window.location.href = '/user/login';
        }
    } else {
        successContainer.innerHTML = '';
        errorsContainer.innerHTML = `<li class="text-danger">${result.error.message}</li>`;
    }
}


form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const entries = formData.entries();
    const user = Object.fromEntries(entries);
    const { option } = user;
    delete user.option;

    if(isValidUser(user)) {
        const json = JSON.stringify(user);
        if (option === 'login') {
            const response = await fetch(`${API_URL_USER}/two-factor-active`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({ username: user.username })
            });
            const result = await response.json();

            if (response.ok && result.success) {
                await fetch(`${API_URL_USER}/modal-qr`)
                .then(response => response.text())
                .then(data => {
                    document.getElementById('modal-container').innerHTML = ''; 
                    document.getElementById('modal-container').innerHTML = data; 
                    const myModal = new bootstrap.Modal(document.getElementById('qrcode'));
                    myModal.show();
                });

                document.getElementById('verify-code-btn').addEventListener('click',async () => {
                    const authCode = document.getElementById('auth-code').value;

                    if (!authCode) {
                        alert('Please enter the 6-digit code.');
                        return;
                    }

                    await fetch(`${API_URL_USER}/verify-2fa`, {
                        method: 'POST',
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ token: authCode, username: user.username })
                    })
                    .then(response => response.json())
                    .then(result => {
                        if (result.success) {
                            alert('2FA activated successfully.');
                            const myModal = bootstrap.Modal.getInstance(document.getElementById('qrcode'));
                            myModal.hide();
                            handleLoginOrRegister(json, option);

                        } else {
                            alert('Invalid code. Please try again.');
                        }
                    })
                    .catch(err => {
                        alert('An error occurred while verifying the code. Please try again.');
                    });
                });
            }else {
                handleLoginOrRegister(json, option);
            }
            
        } else {
            handleLoginOrRegister(json, option);
        }
    }
});

async function handleLoginOrRegister(userData, action) {
    const result = await makePostRequest(`${API_URL_USER}/${action}`, userData);
    handleResponse(result, action);
}