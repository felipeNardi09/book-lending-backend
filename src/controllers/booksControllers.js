import { Books } from '../models/bookModel.js';
import AppError from '../utils/appError.js';

export const createBook = async (req, res, next) => {
    try {
        const book = await Books.create({
            title: req.body.title,
            genre: req.body.genre,
            author: req.body.author,
            synopsis: req.body.synopsis,
            numberOfPages: req.body.numberOfPages,
            language: req.body.language,
            publisher: req.body.publisher,
            publicationDate: req.body.publicationDate,
            numberOfCopies: req.body.numberOfCopies
        });

        res.status(201).json({
            status: 'Success',
            data: book
        });
    } catch (error) {
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

export const updateBook = async (req, res, next) => {
    const { id } = req.params;

    try {
        const updatedBook = await Books.findByIdAndUpdate(id, req.body, {
            new: true
        });

        if (!updatedBook) {
            return next(new AppError('There is no book with provided id', 404));
        }

        res.status(200).json({
            status: 'Success',
            data: updatedBook
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

export const getBookById = async (req, res, next) => {
    const { id } = req.params;

    try {
        const book = await Books.findById(id);

        if (!book) {
            return next(
                new AppError('No book was found with provided id', 404)
            );
        }

        res.status(200).json({
            status: 'Success',
            data: book
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

export const getAllBooks = async (req, res, next) => {
    try {
        const books = await Books.find();

        res.status(200).json({
            status: 'Success',
            total: books.length,
            data: books
        });
    } catch (error) {
        return next(new AppError(error.message));
    }
};

export const deleteBook = async (req, res, next) => {
    const { id } = req.params;

    try {
        const book = await Books.findByIdAndDelete(id);

        if (!book) {
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
