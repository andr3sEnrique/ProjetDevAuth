const { Blog } = require('../database/Blog.model');
const path = require('node:path');
const fs = require('node:fs');

module.exports.getFeaturedBlogsPublics = async (req, res, next) => {
    const blogs = await Blog.find({ isPrivate: false }).limit(5);
    return res.jsonSuccess(blogs, 201);
}

module.exports.sendUpdateBlog = async (req, res) => {
    const { id } = req.params;
    const body = req.body;

    const blog = await Blog.findByIdAndUpdate(id, body);

    if (!blog) {
        return res.jsonError("Blog not found.", 404);
    }

    return res.jsonSuccess("Blog updated successfully.", 200);
}

module.exports.getBlog = async (req, res) => {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
        return res.jsonError("Blog not found.", 404);
    }

    return res.jsonSuccess(blog, 200);
}

module.exports.deleteBlog = async (req, res, next) => {
    const { id } = req.params;
    const blog = await Blog.deleteOne({ _id: id });
    if (blog.deletedCount === 0) return res.jsonError(`No blogs available with id ${id}`, 404);
    return res.jsonSuccess(blog, 200);
}

module.exports.updateBlog = async (req, res, next) => {
    res.sendFile(path.join(__dirname, '../public/views/content', 'update-form.html'));
}

module.exports.getForm = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/views/content', 'blog-form.html'));
}

module.exports.getNavbar = (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'navbar.html'));
}

module.exports.getBlogsPublics = async (req, res, next) => {
    const blogs = await Blog.find({ isPrivate: false });
    return res.jsonSuccess(blogs, 201);
}

module.exports.getPrivateBlogs = async (req, res) => {
    const blogs = await Blog.find({})
}

module.exports.createBlog = async (req, res) => {
    const body = req.body;
    let username;
    if (req.session?.passport?.user?.username) {
        username = req.session.passport.user.username;
    }else if (req.session?.userId && req.session?.loggedIn) {
        username = req.session.userId;
    }

    if (!username) {
        return res.jsonError('User not logged in', 401);
    }

    const userFile = `./users/${username}.json`;
    if (!fs.existsSync(userFile)) {
        return res.jsonError('User not found', 404);
    }
    const { name } = JSON.parse(fs.readFileSync(userFile));

    const existingBlog = await Blog.findOne({title: body.title});
    if (existingBlog) return res.jsonError(
        `A blog is existing with the same title: ${body.title}`, 409);
    
    console.log("user: ", username, name);

    const newBlog = new Blog({
        author: name,
        user: username,
        ...body
    });

    await newBlog.save();
    return res.jsonSuccess(newBlog, 201);

}

module.exports.getProfileUser = async (req, res) => {
    let username;
    if (req.session?.passport?.user?.username) {
        username = req.session.passport.user.username;
    }else if (req.session?.userId && req.session?.loggedIn) {
        username = req.session.userId;
    }

    if (!username) {
        return res.jsonError('User not logged in', 401);
    }

    const allBlogs = await Blog.find({ user: username});

    return res.jsonSuccess(allBlogs, 201);

}

module.exports.getAllUserBlogs = async (req, res) => {
    const { user } = req.params;

    if (!user) {
        return res.jsonError('User not found', 404);
    }
    const userFile = `./users/${user}.json`;

    if (!fs.existsSync(userFile)) {
        return res.jsonError('User not found', 404);
    }

    const userData = JSON.parse(fs.readFileSync(userFile));
    const responseData = { ...userData };
    delete responseData.password;

    const allBlogs = await Blog.find({ user: user});
    responseData.blogs = allBlogs;
    return res.jsonSuccess(responseData, 201);

}