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
    updateUser,
    deleteUserById,
    reactivateAccount
} from '../controllers/usersController.js';
import { tokenValidation } from '../middlewares/tokenValidation.js';
import { restrictTo } from '../middlewares/restrictTo.js';

const usersRouter = Router();

usersRouter.post('/signup', signUp);
usersRouter.post('/login', login);

usersRouter.post('/forgot-password', forgotPassword);
usersRouter.patch('/update-password/:token', updatePassword);
usersRouter.patch('/reactivate-account', reactivateAccount);

usersRouter.use(tokenValidation);
usersRouter.get('/current-user', currentUser);
usersRouter.patch('/update-user', updateUser);
usersRouter.patch('/delete-user', deleteUser);
usersRouter.patch('/log-out', logout);

usersRouter.use(restrictTo);
usersRouter.patch('/delete-by-id/:id', deleteUserById);
usersRouter.get('/', getAllUsers);
usersRouter.get('/user/:id', getUserById);

export default usersRouter;
