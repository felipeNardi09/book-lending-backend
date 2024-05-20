import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import AppError from '../utils/appError.js';

export const tokenValidation = async (req, res, next) => {
    let token;

    if (
        !req.headers.authorization ||
        !req.headers.authorization.startsWith('Bearer')
    ) {
        return next(new AppError('Login to perform this action.', 401));
    } else {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError(
                'You are not logged in! Please log in to get access.',
                401
            )
        );
    }

    const decoded = await jwt.verify(
        token,
        process.env.JWT_SECRET_KEY,
        function (error, decoded) {
            if (error) {
                if (error.name === 'TokenExpiredError') {
                    return next(new AppError('Token expired', 401));
                }
            } else {
                return decoded;
            }
        }
    );

    if (!decoded) {
        return next(new AppError('Invalid token', 401));
    }

    const { iat, id } = decoded;

    const user = await User.findById(id);

    if (!user) {
        return next(new AppError('This user no longer exists.', 401));
    }

    if (await user.chagedPasswordAfter(iat)) {
        return next(
            new AppError(
                'Your password has changed, plase log in to perform this action.',
                401
            )
        );
    }

    req.user = user;

    next();
};
