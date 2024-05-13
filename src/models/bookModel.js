import mongoose from 'mongoose';

const booksSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            unique: true,
            required: [true, 'The book needs a title.']
        },
        genre: {
            type: String,
            required: [true, 'The book needs a category.']
        },
        author: {
            type: String,
            required: [true, 'The book needs an autor.']
        },
        synopsis: {
            type: String,
            required: [true, 'The book needs a synopsis.']
        },
        numberOfPages: {
            type: Number,
            required: [true, `Enter the book's number of pages.`]
        },
        language: {
            type: String,
            required: [true, `Enter the book's language.`]
        },
        publisher: {
            type: String,
            required: [true, `Enter the book's publisher.`]
        },
        publicationDate: {
            type: Date,
            default: 'Unknown'
        },
        numberOfCopies: {
            type: Number,
            default: 1
        }
    },
    {
        timestamps: true
    }
);
export const Books = mongoose.model('Book', booksSchema);
