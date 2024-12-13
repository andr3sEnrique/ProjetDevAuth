const urlParams = new URLSearchParams(window.location.search);
const blogId = urlParams.get('user');

const fetchUserProfile = async () => {
    try {
        const isLoggedIn = await verifyToken();
        const userResponse = await fetch(`${API_URL_BLOG}/content-user/${blogId}`);
        const userData = await userResponse.json();

        if (userData.success && userResponse.ok) {
            document.getElementById('userName').innerText = userData.data.name || 'Unknown';
            document.getElementById('userBio').innerText = userData.data.bio || 'No bio available';

            const blogsToShow = isLoggedIn
                ? userData.data.blogs
                : userData.data.blogs.filter(blog => !blog.isPrivate);

            if (blogsToShow.length > 0) {
                createBlogs(blogsToShow);
            }else {
                noBlogs(contentContainer, `
        <div class="alert alert-info text-center mt-4" role="alert">
            There are no public blogs available at this time.
        </div>
    `);
            }
        } else {
            alert('Failed to load user profile.');
        }
    } catch (error) {
        console.error('An error was occurred :', error);
    }
}

const createBlogs = (blogs) => {
    const contentContainer = document.getElementById('contentContainer');
    const blogsNodes = blogs.map(blog => {
        const blogNode = document.createElement('div');
        blogNode.classList.add('col-12', 'col-sm-6', 'col-md-4', 'mb-4');

        blogNode.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5>Name :</h5>
                    <strong>${blog.title}</strong>
                </div>
                <div class="card-body">
                    <h5>Biography :</h5>
                    <p>${blog.content || '...'}</p>
                </div>
            </div>
        `;
        return blogNode;
    });

    contentContainer.innerHTML = '';
    blogsNodes.forEach(blogNode => contentContainer.appendChild(blogNode));
}

const viewBlog = (blogId) => {
    window.location.href = `${API_URL_USER}/view/${blogId}`;
}

window.onload = fetchUserProfile;