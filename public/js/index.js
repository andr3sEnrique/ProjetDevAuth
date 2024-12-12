const API_URL_BLOG = 'http://localhost:3000/blog';
const API_URL_USER = 'http://localhost:3000/user';
const contentContainer = document.getElementById('blog-container');


const fetchBlogs = async () => {
    const response = await fetch(`${API_URL_USER}/publics`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'}
    });

    const result = await response.json();
    const blogs = result.data;

    if (Array.isArray(result.data) && result.data.length > 0) {
        createBlogs(blogs);
    }else {
        noBlogs();
    }
}

// const fetchAllBlogs = async () => {
//     const response = await fetch(`${API_URL_BLOG}/all`, {
//         method: 'get',
//         headers: {'Content-Type': 'application/json'}
//     });
//     const result = await response.json();
//     const blogs = result.data;

//     if (Array.isArray(result.data) && result.data.length > 0) {
//         createBlogs(blogs);
//     }else {
//         noBlogs();
//     }
// };

// const loadContent = (url, callback = null) => {
//     fetch(url)
//     .then(response => response.text())
//     .then(data => {
//         contentContainer.innerHTML = data;
//         if(url === 'profile.html') {
//             const script = document.createElement('script');
//             script.src = 'js/profile.js';
//             script.onload = () => {
//                 if (callback) callback();
//             };
//             document.body.appendChild(script);
//         }else {
//             if(callback) callback();
//         }
//     })
//     .catch(error => console.log('Error loading content', error));
// }



const noBlogs = () => {
    contentContainer.innerHTML = `
        <div class="alert alert-info text-center mt-2" role="alert">
            There are no public blogs available at this time.
        </div>
    `;
}

const createBlogs = (blogs) => {
    const blogsNodes = blogs.map(blog => {
        const blogNode = document.createElement('div');
        blogNode.classList.add('col-12', 'col-sm-6', 'col-md-6', 'mb-4');

        blogNode.innerHTML  = `
            <div class="mt-4">
            <div class="card">
                <div class="card-header">
                    <p><strong>Name:</strong> ${blog.name || '' }</p>
                </div>
                <div class="card-body">
                    <p><strong>Biography:</strong> ${blog.bio || '' }</p>
                </div>
            </div>
        </div>
        `;
        return blogNode;
    });

    contentContainer.innerHTML = '';
    contentContainer.classList.add('row', 'g-4');
    contentContainer.append(...blogsNodes);
}

async function loadNavbar () {
    await fetch(`${API_URL_BLOG}/getNavbar`)
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data; 
        })
        .catch(error => {
            console.error('Error loading the navbar:', error);
        });
}


loadNavbar();
fetchBlogs();
