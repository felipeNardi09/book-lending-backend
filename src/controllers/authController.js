import jwt from 'jsonwebtoken';
import { User } from '../models/userModel.js';
import AppError from '../utils/appError.js';
import sendEmail from '../utils/sendEmail.js';

export const signUp = async (req, res, next) => {
    const { email, name, password, confirmPassword, isAdmin } = req.body;

    try {
        const user = await User.create({
            email,
            name,
            password,
            confirmPassword,
            isAdmin
        });

        const token = await user.generateJWToken(user.id);

        const { iat } = jwt.decode(token);

        return res.status(201).json({
            status: 'Success',
            data: {
                user,
                token: { token, iat }
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(
                (err) => err.message
            );

            return next(
                new AppError(`Invalid input data: ${errors.join(' ')}`),
                400
            );
        }

        if (error.code === 11000) {
            return next(
                new AppError(`${error.keyValue.email} already exists.`)
            );
        }
    }
};

export const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
        return next(new AppError('Enter your e-mail and password.', 404));

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.verifyPassword(password, user.password)))
            return next(
                new AppError(
                    'There is no user with provided login and/or password.',
                    404
                )
            );

        const token = await user.generateJWToken(user.id);

        const { iat } = jwt.decode(token);

        user.session = 'Authenticated';

        await user.save();

        return res.status(200).json({
            status: 'Success',
            data: {
                user: {
                    user: user._id,
                    email: user.email,
                    name: user.name,
                    session: user.session,
                    currentBorrowedBookId: user.currentBorrowedBookId
                },
                token: { token, iat }
            }
        });
    } catch (err) {
        return res.status(400).json({
            error: err.message
        });
    }
};

export const logout = async (req, res, next) => {
    const { id } = req.user;

    try {
        await User.findByIdAndUpdate(
            id,
            {
                session: 'Unauthenticated'
            },
            { new: true }
        );

        return res.status(200).json({
            status: 'Success',
            message: 'You logged out'
        });
    } catch (error) {
        return res.status(400).json({
            error: err.message
        });
    }
};

export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return next(
            new AppError('There is no user with provided e-mail.', 404)
        );
    }

    const resetPasswordToken = user.generateHashedTokenForResetPassword();

    await user.save({ validateBeforeSave: false });

    try {
        await sendEmail(
            user.email,
            'Did you forget your password? This is the update e-mail.',
            resetPasswordToken
        );

        res.status(204).json({
            status: 'Success',
            message: 'An update password e-mail was sent to you.'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpiresIn = undefined;

        await user.save({ validateBeforeSave: false });

        next(new AppError('There was an error sending the e-mail.', 500));
    }
};

export const updatePassword = async (req, res, next) => {
    const { token } = req.params;
    const user = await User.findOne({ passwordResetToken: token });

    if (!user) {
        return next(new AppError('Invalid token', 401));
    }

    if (Date.now() > user.passwordResetExpiresIn) {
        return next(
            new AppError('The time to reset your password already expired', 401)
        );
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordChangedAt = Date.now();
    user.passwordResetToken = undefined;
    user.passwordResetExpiresIn = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(204).json({
        status: 'Success',
        message: 'Your password has been updated.'
    });
};
