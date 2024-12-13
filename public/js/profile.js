const API_URL_USER = 'http://localhost:3000/user'
const API_URL_BLOG = 'http://localhost:3000/blog'
const form = document.querySelector("form");
const errorsContainer = document.getElementById('errors');
const successContainer = document.getElementById('success');
const btnCreate = document.getElementById('btn-create');

async function loadNavbar () {
    await fetch(`${API_URL_BLOG}/getNavbar`)
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data; 
            initNavbar();
        })
        .catch(error => {
            console.error('Error loading the navbar:', error);
        });
}

async function loadQrCode () {
    const response = await fetch(`${API_URL_USER}/modal-qr`)
    const result = await response.text();

    return result;
}

loadNavbar();

const getBlogs = async () => {
    const response = await fetch(`${API_URL_BLOG}/user-blogs`, {
        method: 'GET',
        credentials: 'include'
    });

    const result = await response.json();

    if (response.ok && result.success) {
        const blogs = result.data;
        const blogsContainer = document.getElementById('user-blogs');
        blogsContainer.innerHTML = ''; 

        if (blogs.length > 0) {
            blogs.forEach(blog => {
                const blogNode = document.createElement('div');
                blogNode.classList.add('col-12', 'col-sm-6', 'col-md-6', 'mb-4');
                blogNode.innerHTML = `
                <div class="mt-4">
                    <div class="card">
                        <div class="card-header">
                            <p><strong>Title : </strong>${blog.title}</p>
                        </div>
                        <div class="card-body">
                            <p><strong>Content : </strong>${blog.content}</p>
                            <p><strong>Is Private : </strong>${blog.isPrivate}</p>
                            <small>by ${blog.author}</small>
                            <div class="mb-3 mt-3">
                                <button class="btn btn-danger" data-id="${blog._id}">Delete</button>
                                <button class="btn btn-info" data-id="${blog._id}">Modify</a>
                            </div>
                        </div>
                    </div>
                 </div>
            
                `;
                blogsContainer.classList.add('row', 'g-4');
                blogsContainer.appendChild(blogNode);
            });

            const updateButtons = blogsContainer.querySelectorAll('.btn-info');
            updateButtons.forEach(button =>  {
                button.addEventListener('click', async (e) => {
                    const id = e.target.dataset.id;
                    handleNavigation(`${API_URL_BLOG}/update?id=${id}`);
                });
            })

            const deleteButtons = blogsContainer.querySelectorAll('.btn-danger');
            deleteButtons.forEach(button =>(
                button.addEventListener('click', async (e) => {
                    const id = e.target.dataset.id;
                    const answer = confirm('Are you sure you want to delete this chapter?');
                    if (answer) {
                        const response = await fetch(`${API_URL_BLOG}/${id}`, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`,
                            },
                            credentials: "include"
                        });
                        const result = await response.json();
                        if (response.ok && result.success) {
                            successContainer.innerHTML = `<li class="text-success">Chapter deleted successfully</li>`;
                            errorsContainer.innerHTML = '';
                            initializeProfile();
                        }else {
                            successContainer.innerHTML = '';
                            errorsContainer.innerHTML = `<li class="text-danger">${result.error.message}</li>`;
                        }
                    }
                })
            ) )
        } else {
            blogsContainer.innerHTML = '<li>No blogs found</li>';
        }
    } else {
        console.error('Failed to fetch user blogs:', result.error.message);
    }

}

async function enableTwoFactor() {
    const qrModal = await loadQrCode();
    document.getElementById('modal-container').innerHTML = ''; 
    document.getElementById('modal-container').innerHTML = qrModal; 

    await fetch(`${API_URL_USER}/qrcode`, {
        method: 'GET',
        credentials: 'include',
    })
    .then(response => response.text())
    .then(data => {
        document.getElementById('qrcode-container').innerHTML = ''; 
        document.getElementById('qrcode-container').innerHTML = data; 
        const myModal = new bootstrap.Modal(document.getElementById('qrcode'));
        myModal.show();
    });

    document.getElementById('verify-code-btn').addEventListener('click', async () => {
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
            body: JSON.stringify({ token: authCode })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                alert('2FA activated successfully.');
                const myModal = bootstrap.Modal.getInstance(document.getElementById('qrcode'));
                myModal.hide();
                initializeProfile();
            } else {
                alert('Invalid code. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error verifying 2FA code:', error);
            alert('An error occurred. Please try again later.');
        });
    });
}

const initializeProfile = async () => {
    const response = await fetch(`${API_URL_USER}/information`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
        
        const data = result.data;

        Object.keys(data).forEach((key) => {
            const input = document.getElementById(key);
            if (input) {
                input.value = data[key];
            }
        });

        if (data.isPublic) {
            const isPublicCheckbox = document.getElementById('ispublic');
            if (isPublicCheckbox) {
                isPublicCheckbox.checked = true;
            }
        }

        const twoFactorContainer = document.getElementById('two-factor-button-container');
        if (twoFactorContainer) {
            twoFactorContainer.innerHTML = ''; 
            const button = document.createElement('button');
            button.className = data.twoFactorEnabled ? 'btn btn-danger' : 'btn btn-success';
            button.innerText = data.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA';

            button.addEventListener('click', async () => {
                enableTwoFactor();

                await initializeProfile();
            });

            twoFactorContainer.appendChild(button);
        }


        getBlogs();

    }else {
        console.error('Failed to fetch user information:', result.error.message);
    }
}

initializeProfile();

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    var myModal = new bootstrap.Modal(document.getElementById('password-dialog'));
    myModal.show();

    const verifyButton = document.getElementById('verify-password');
    verifyButton.addEventListener('click', async () => {
        const currentPassword = document.getElementById('current-password').value;
        
        if (!currentPassword) {
            alert('Please enter your current password');
            return;
        }

        const formData = new FormData(form);
        const entries = formData.entries();
        const user = Object.fromEntries(entries);
        const username = user.username;

        const response = await fetch(`${API_URL_USER}/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
             },
            body: JSON.stringify({
                username: username,
                password: currentPassword
            }),
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok && result.success) {

            const user = Object.fromEntries(formData.entries());
            

            const isPublicCheckbox = document.getElementById('ispublic');
            if (isPublicCheckbox.checked) {
                user.isPublic = true;
            } else {
                user.isPublic = false;
            }

            console.log(user);

            if (user.password) {
                isValidPassword(user.password, user.confirmPassword);
            }

            const json = JSON.stringify(user);
            
            const updateResponse = await fetch(`${API_URL_USER}/update`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: json,
                credentials: 'include'
            });

            const updateResult = await updateResponse.json();
            if (updateResponse.ok && updateResult.success) {
                successContainer.innerHTML = `<li class="text-success">Information updated successfully</li>`;
                errorsContainer.innerHTML = '';
                initializeProfile();
            } else {
                successContainer.innerHTML = '';
                errorsContainer.innerHTML = `<li class="text-danger">${updateResult.error.message}</li>`;
            }

            myModal.hide();
        } else {
            alert('Incorrect password, please try again');
        }
    });
});


const isValidPassword = (password, repeatPassword) => {
    let errors = [];

    if(password.length < 8) {
        errors.push('Password must contains 8 characters');
    }

    if(password !== repeatPassword) {
        errors.push('password are not equals');
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


btnCreate.addEventListener('click', async () => {
    if(!await isValidProfile()) {
        alert('Please complete your information and/or enable two factor authentication');
    }else {
        await fetch(`${API_URL_BLOG}/getFormBlog`)
        .then(response => response.text())
        .then(data => {
            document.getElementById('modal-container').innerHTML = ''; 
            document.getElementById('modal-container').innerHTML = data; 

            const myModal = new bootstrap.Modal(document.getElementById('createBlogModal'));
            myModal.show();

            const createBlogForm = document.getElementById('createBlogForm');
            createBlogForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                const formData = new FormData(createBlogForm);
                const blogData = Object.fromEntries(formData.entries());

                console.log(blogData);

                try {
                    const response = await fetch(`${API_URL_BLOG}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(blogData),
                        credentials: 'include'
                    });

                    const result = await response.json();

                    if (response.ok && result.success) {
                        alert('Blog created successfully!');
                        myModal.hide();
                    } else {
                        alert('Error creating blog: ' + result.error.message);
                    }
                } catch (error) {
                    console.error('Error during the request:', error);
                }
            });
        })
        .catch(error => {
            console.error('Error loading the form:', error);
        });
    }
    
})


const isValidProfile = async () => {
    const response = await fetch(`${API_URL_USER}/verify-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    });

    const result = await response.json();

    if (response.ok && result.success) return true;

    return false;
}