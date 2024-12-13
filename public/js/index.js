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
            <div class="card" style="cursor: pointer;" onclick="viewBlog('${blog.username}')">
                <div class="card-header">
                    <h5>Name :</h5>
                    <strong>${blog.name}</strong>
                </div>
                <div class="card-body">
                    <h5>Biography :</h5>
                    <p> ${blog.bio}</p>
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
            initNavbar();
        })
        .catch(error => {
            console.error('Error loading the navbar:', error);
        });
}

const viewBlog = (blogId) => {
    window.location.href = `${API_URL_USER}/view?user=${blogId}`;
}

loadNavbar();
fetchBlogs();
