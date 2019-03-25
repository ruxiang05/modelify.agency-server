const express = require('express');
const { verifyToken } = require('../middleware');
const upload = require('../services/file-upload');

const router = express.Router();
const UserController = require('../controllers/user');

router.post('/signup', UserController.signup);
router.post('/login', UserController.login);
router.get('/', UserController.getUserbyId);
router.put('/edit', verifyToken, UserController.updateUser);
router.delete('/:id', verifyToken, UserController.deleteUser);
router.post('/image-upload', upload.single('image') , UserController.uploadImage);


module.exports = router;
