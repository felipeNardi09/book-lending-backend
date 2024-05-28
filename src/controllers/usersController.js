import { User } from '../models/userModel.js';
import AppError from '../utils/appError.js';

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await User.find();

        if (!users.length) {
            return next(
                new AppError('There are no users registered yet.', 404)
            );
        }
        return res.status(200).json({
            status: 'Success',
            data: users
        });
    } catch (error) {
        return next(new AppError('Something went wrong'));
    }
};

export const getUserById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id).select('+isActive');

        if (!user) {
            return next(
                new AppError('There is no user with the provided id.', 404)
            );
        }
        return res.status(200).json({
            status: 'Success',
            data: user
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(
                new AppError(`Invalid ${error.path}:${error.value}`),
                400
            );
        }
    }
};

export const currentUser = async (req, res, next) => {
    try {
        return res.status(200).json({
            status: 'Success',
            data: req.user
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(
                new AppError(`Invalid ${error.path}:${error.value}`),
                400
            );
        }
    }
};

export const updateUser = async (req, res, next) => {
    if (req.body.password) {
        return next(
            new AppError('Use the password update route instead.', 401)
        );
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            filterObj(req.body, 'name', 'email'),
            {
                new: true
            }
        );

        res.status(200).json({
            status: 'Success',
            data: updatedUser
        });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(
                new AppError(`Invalid ${error.path}:${error.value}`),
                400
            );
        }
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        await User.findByIdAndUpdate(
            req.user.id,
            { isActive: false },
            {
                new: true
            }
        );

        res.status(200).json({ user: req.user });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(
                new AppError(`Invalid ${error.path}:${error.value}`),
                400
            );
        }
    }
};

export const reactivateAccount = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.verifyPassword(password, user.password)))
            return next(
                new AppError(
                    'There is no user with provided login and/or password.',
                    404
                )
            );

        if (user.isActive)
            return next(new AppError('User is already active', 403));

        await User.findByIdAndUpdate(
            user._id,
            { isActive: true },
            { new: true }
        );

        res.status(200).json({ user });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(
                new AppError(`Invalid ${error.path}:${error.value}`),
                400
            );
        }
    }
};

export const deleteUserById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const user = await User.findById(id);

        if (!user)
            return next(new AppError('There is no user with provided id', 404));

        if (user.currentBorrowedBookId)
            return next(
                new AppError(
                    'You can not delete a user before he returns the book',
                    403
                )
            );

        await User.findByIdAndUpdate(
            user._id,
            { isActive: false },
            { new: true }
        );

        res.status(200).json({ user });
    } catch (error) {
        if (error.name === 'CastError') {
            return next(
                new AppError(`Invalid ${error.path}:${error.value}`),
                400
            );
        }
    }
};
