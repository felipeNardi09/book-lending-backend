import { Router } from 'express';
import {
    signUp,
    login,
    forgotPassword,
    updatePassword,
    logout
} from '../controllers/authController.js';
import {
    deleteUser,
    getAllUsers,
    currentUser,
    getUserById,
    updateUser
} from '../controllers/usersController.js';
import { tokenValidation } from '../middlewares/tokenValidation.js';
import { restrictTo } from '../middlewares/restrictTo.js';

const usersRouter = Router();

usersRouter.post('/signup', signUp);
usersRouter.post('/login', login);

usersRouter.post('/forgot-password', forgotPassword);
usersRouter.patch('/update-password/:token', updatePassword);

usersRouter.use(tokenValidation);
usersRouter.get('/current-user', currentUser);
usersRouter.patch('/update-user', updateUser);
usersRouter.patch('/delete-user', deleteUser);
usersRouter.patch('/log-out', logout);

usersRouter.get('/', restrictTo, getAllUsers);
usersRouter.get('/user/:id', restrictTo, getUserById);

export default usersRouter;
