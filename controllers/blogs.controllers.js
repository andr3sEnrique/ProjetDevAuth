const { Blog } = require('../database/Blog.model');
const path = require('node:path');
const fs = require('node:fs');

module.exports.getFeaturedBlogsPublics = async (req, res, next) => {
    const blogs = await Blog.find({ isPrivate: false }).limit(5);
    return res.jsonSuccess(blogs, 201);
}
module.exports.getForm = (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'blog-form.html'));
}

module.exports.getNavbar = (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'navbar.html'));
}

module.exports.getBlogsPublics = async (req, res, next) => {
    const blogs = await Blog.find({ isPrivate: false });
    return res.jsonSuccess(blogs, 201);
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

module.exports.getAllUserBlogs = async (req, res) => {
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