const { Router } = require('express');
const { verifyJWToken } = require('../middlewares/auth');
const passport = require('passport');
const { createAccount, loginUser, getBlogUserView, logoutAllDevices, logoutUser, 
    getCurrentUser, isLogged, isTwoFactorActivate, getQrCode, getLogin, showQrModal, 
    getRegister, getProfileView, getUsersPublics, getUsersPrivates, updateUser, passwordMatch, 
    isValidProfile, verifyToken, 
    getPrivateView} = require('../controllers/users.controllers');

const router = Router();

router.post('/register', createAccount);
router.get('/login', getLogin);
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/');
    }
);
router.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email'] })
);
router.get('/auth/github/callback',
    passport.authenticate('github', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/');
    }
);
router.post('/verify-profile',verifyJWToken, isValidProfile);
router.get('/modal-qr', showQrModal);
router.get('/register', getRegister);
router.get('/verifierToken', verifyJWToken);
router.put('/update',verifyJWToken, updateUser);
router.post('/verify', verifyJWToken, passwordMatch);
router.post('/login', loginUser);
router.post('/two-factor-active', isTwoFactorActivate);
router.post('/logout', verifyJWToken, logoutUser);
router.post('/logout-all', verifyJWToken, logoutAllDevices);
router.get('/information', verifyJWToken, getCurrentUser);
router.get('/view', getBlogUserView);
router.get('/profile', getProfileView);
router.get('/isLogged', verifyJWToken, isLogged);
router.get('/publics', getUsersPublics);
router.get('/private', getPrivateView);
router.get('/privates', getUsersPrivates);
router.get('/qrcode', getQrCode);
router.post('/verify-2fa', verifyToken);


module.exports = router;