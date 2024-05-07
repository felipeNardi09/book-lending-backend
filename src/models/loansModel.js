import mongoose, { Schema } from 'mongoose';

export const loansSchema = new mongoose.Schema(
    {
        _borrowerId: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        _borrowedBookId: {
            type: Schema.Types.ObjectId,
            ref: 'Book'
        },
        _borrowedBookTitle: {
            type: String
        },
        hasBeenReturned: {
            type: Boolean,
            default: false
        },
        rentalDate: {
            type: Date
        },
        returnDate: {
            type: Date
        },
        retrieveDate: {
            type: Schema.Types.Mixed,
            default: ''
        }
    },
    { timestamps: true }
);

export const Loan = mongoose.model('Loan', loansSchema);
