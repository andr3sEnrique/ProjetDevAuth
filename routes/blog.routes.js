const { Router } = require('express');
const { verifyJWToken } = require('../middlewares/auth');

const { getFeaturedBlogsPublics, getProfileUser, getBlog, sendUpdateBlog, createBlog, updateBlog, getPrivateBlogs, deleteBlog, getBlogsPublics, getNavbar, getAllUserBlogs, getForm } = require("../controllers/blogs.controllers");

const router = Router();

router.get('/', getFeaturedBlogsPublics);
router.get('/getNavbar', getNavbar);
router.get('/getFormBlog', getForm);
router.get('/all', getBlogsPublics);
router.delete('/:id', verifyJWToken, deleteBlog);
router.get('/update', updateBlog);
router.get('/one/:id', verifyJWToken, getBlog);
router.put('/update/:id', verifyJWToken, sendUpdateBlog);
router.post('/', createBlog)
router.get('/user-blogs', getProfileUser);
router.get('/content-user/:user', getAllUserBlogs);


module.exports = router;