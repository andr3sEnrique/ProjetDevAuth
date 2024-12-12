const { Router } = require('express');
const { getFeaturedBlogsPublics, createBlog, getBlogsPublics, getNavbar, getAllUserBlogs, getForm } = require("../controllers/blogs.controllers");

const router = Router();

router.get('/', getFeaturedBlogsPublics);
router.get('/getNavbar', getNavbar);
router.get('/getFormBlog', getForm);
router.get('/all', getBlogsPublics)
router.post('/', createBlog)
router.get('/user-blogs', getAllUserBlogs)


module.exports = router;