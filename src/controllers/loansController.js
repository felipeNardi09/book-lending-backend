import mongoose from 'mongoose';
import { Loan } from '../models/loansModel.js';
import { Books } from '../models/bookModel.js';
import AppError from '../utils/appError.js';

export const createLoan = async (req, res, next) => {
    const { bookId } = req.params;

    const { id } = req.user;

    const session = await mongoose.startSession();

    session.startTransaction();

    try {
        const book = await Books.findById(bookId).session(session);

        if (!book) {
            return next(
                new AppError('There is no book with provided id.', 404)
            );
        }
        if (!book.numberOfCopies) {
            return next(new AppError('There are no copies available', 404));
        }

        if (
            req.user.currentBorrowedBookId === book.id ||
            req.user.currentBorrowedBookId
        ) {
            return next(
                new AppError(
                    'You need to return the current book to borrow another one',
                    403
                )
            );
        }

        const loan = await Loan.create({
            _borrowerId: id,
            _borrowedBookId: book.id,
            _borrowedBookTitle: book.title,
            rentalDate: Date.now(),
            returnDate: Date.now() + 1000 * 60 * 60 * 24 * 7
        });

        book.numberOfCopies -= 1;

        req.user.currentBorrowedBookId = book.id;
        req.user._loanId.push(loan.id);
        req.user._currentLoanId = loan.id;

        await book.save({ validateBeforeSave: false, session });
        await req.user.save({ validateBeforeSave: false, session });
        await session.commitTransaction();

        res.status(201).json({
            status: 'Success',
            message: 'Rental card was created successfully',
            data: loan
        });
    } catch (error) {
        await session.abortTransaction();

        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(
                (err) => err.message
            );

            next(new AppError(`Invalid input data: ${errors.join(' ')}`), 400);
        }

        if (error.code === 11000) {
            return next(
                new AppError(
                    `Duplicate field: ${Object.keys(error.keyValue)}. ${error.keyValue.title} already exists.`,
                    400
                )
            );
        }
    }
};

export const retrieveBookFromLoan = async (req, res, next) => {
    const { currentBorrowedBookId } = req.user;
    const { id } = req.params;

    if (!currentBorrowedBookId) {
        return next(new AppError('You have no borrowed books.', 404));
    }

    const session = await mongoose.startSession();

    session.startTransaction();
    try {
        const book = await Books.findById(currentBorrowedBookId).session(
            session
        );

        if (!book) {
            return next(
                new AppError(
                    'This book is not available anymore, please contact us',
                    404
                )
            );
        }

        const loan = await Loan.findByIdAndUpdate(
            id,
            { hasBeenReturned: true, retrieveDate: new Date() },
            {
                new: true
            }
        );

        if (!loan) return next(new AppError('No loan was found', 404));

        book.numberOfCopies += 1;
        req.user.currentBorrowedBookId = '';
        req.user._currentLoanId = '';

        await book.save({ validateBeforeSave: false, session });
        await req.user.save({ session });

        await session.commitTransaction();

        res.status(200).json({
            status: 'Success',
            message: 'The book was successfully retrieved.',
            data: { book, user: req.user }
        });
    } catch (error) {
        await session.abortTransaction();
        return next(new AppError(error.message));
    }
};
export const getLoansByUser = async (req, res, next) => {
    const { id } = req.user;

    try {
        const loans = await Loan.find({ _borrowerId: id }).sort({
            createdAt: -1
        });

        if (!loans) {
            return next(
                new AppError('No loan was found with provided id', 404)
            );
        }

        res.status(200).json({
            status: 'Success',
            total: loans.length,
            data: loans.length ? loans : 'There are no loans yet.'
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

export const getAllLoans = async (req, res, next) => {
    try {
        const loans = await Loan.find();

        res.status(200).json({
            status: 'Success',
            total: loans.length,
            data: loans.length ? loans : 'There are no loans yet.'
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

export const getLoanById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const loan = await Loan.findById(id);

        if (!loan) {
            return next(
                new AppError('No loan was found with provided id', 404)
            );
        }

        res.status(200).json({
            status: 'Success',
            data: loan
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

export const updateLoan = async (req, res, next) => {
    const { id } = req.params;

    try {
        const updatedLoan = await Loan.findByIdAndUpdate(id, req.body, {
            new: true
        });

        if (!updatedLoan) {
            return next(new AppError('There is no book with provided id', 404));
        }

        res.status(200).json({
            status: 'Success',
            data: updatedLoan
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

export const deleteLoan = async (req, res, next) => {
    const { id } = req.params;

    try {
        const loan = await Loan.findByIdAndDelete(id);

        if (!loan) {
            return next(
                new AppError('There is no book with provided id.', 404)
            );
        }

        res.status(204).json({
            status: 'Sucess',
            message: 'The book has been deleted.'
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
