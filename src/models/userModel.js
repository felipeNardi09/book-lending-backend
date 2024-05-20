/* eslint-disable no-console */
import crypto from 'crypto';
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            unique: true,
            required: [true, 'You must enter a valid e-mail']
        },
        name: {
            type: String,
            required: [true, 'You must enter a valid name']
        },
        password: {
            type: String,
            required: [true, 'You must enter a valid password'],
            select: false
        },
        confirmPassword: {
            type: String,
            validate: {
                validator: function (confirmPassword) {
                    return confirmPassword === this.password;
                },
                message: 'Passwords must match.'
            }
        },
        changedPasswordAt: {
            type: Date
        },
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user'
        },
        session: {
            type: String,
            enum: ['Authenticated', 'Unauthenticated'],
            default: 'Authenticated'
        },
        isActive: {
            type: Boolean,
            default: true
        },
        passwordResetToken: {
            type: String
        },
        passwordResetExpiresIn: {
            type: Date
        },
        _loanId: {
            type: [Schema.Types.ObjectId]
        },
        currentBorrowedBookId: {
            type: Schema.Types.Mixed,
            ref: 'Book',
            default: ''
        },
        _currentLoanId: {
            type: Schema.Types.Mixed,
            ref: 'Loan',
            default: ''
        }
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    try {
        this.password = await bcrypt.hash(this.password, 12);
    } catch (err) {
        console.log(err);
    }

    this.confirmPassword = undefined;
});

userSchema.methods.verifyPassword = async function (
    providedPassword,
    hashedPassword
) {
    return await bcrypt.compare(providedPassword, hashedPassword);
};

userSchema.methods.generateJWToken = async function (id) {
    const token = await jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    return token;
};

userSchema.methods.chagedPasswordAfter = function (jwtIat) {
    return this.changedPasswordAt > jwtIat;
};

userSchema.methods.generateHashedTokenForResetPassword = function () {
    const token = crypto.randomBytes(32).toString('hex');

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    this.passwordResetToken = hashedToken;

    this.passwordResetExpiresIn = Date.now() + 1000 * 60 * 10;

    return hashedToken;
};

export const User = mongoose.model('User', userSchema);
