const form = document.querySelector("form");
const API_URL_BLOG = 'http://localhost:3000/blog'
const urlParams = new URLSearchParams(window.location.search);
const token = localStorage.getItem('token');
const blogId = urlParams.get('id');

document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch(`${API_URL_BLOG}/one/${blogId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })

    const result = await response.json();

    if (response.ok && result.success) {
        
        const data = result.data;
console.log(data);
        Object.keys(data).forEach((key) => {
            const input = document.getElementById(key);
            if (input) {
                input.value = data[key];
            }
        });

        if (data.isPrivate) {
            const isPublicCheckbox = document.getElementById('isPrivate');
            if (isPublicCheckbox) {
                isPublicCheckbox.checked = true;
            }
        }

    }else {
        console.error('Failed to fetch user information:', result.error.message);
    }
})

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(form);
    const entries = formData.entries();
    const blog = Object.fromEntries(entries);
    const isPublicCheckbox = document.getElementById('isPrivate');
    if (isPublicCheckbox.checked) {
        blog.isPrivate = true;
    } else {
        blog.isPrivate = false;
    }
    
    const response = await fetch(`${API_URL_BLOG}/update/${blogId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(blog),
        credentials: "include"
    })

    const result = await response.json();
    if (response.ok && result.success) {
        alert('Post updated successfully');
        window.location.href = '/user/profile'
    }else {
        alert(response.error.message);
    }
})