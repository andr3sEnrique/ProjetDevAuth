const { Router } = require('express');
const passport = require('passport');
const { createAccount, loginUser, logoutUser, getCurrentUser, isLogged, isTwoFactorActivate, getQrCode, getLogin, showQrModal, getRegister, getProfileView, getUsersPublics, updateUser, passwordMatch, isValidProfile, verifyToken } = require('../controllers/users.controllers');

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
router.post('/verify-profile', isValidProfile)
router.get('/modal-qr', showQrModal)
router.get('/register', getRegister);
router.put('/update', updateUser);
router.post('/verify', passwordMatch)
router.post('/login', loginUser);
router.post('/two-factor-active', isTwoFactorActivate);
router.post('/logout', logoutUser);
router.get('/information', getCurrentUser)
router.get('/profile', getProfileView)
router.get('/isLogged', isLogged)
router.get('/publics', getUsersPublics)
router.get('/qrcode', getQrCode)
router.post('/verify-2fa', verifyToken);


module.exports = router;