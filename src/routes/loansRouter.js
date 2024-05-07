import Router from 'express';
import {
    getAllLoans,
    getLoanById,
    createLoan,
    updateLoan,
    deleteLoan,
    retrieveBookFromLoan,
    getLoansByUser
} from '../controllers/loansController.js';
import { tokenValidation } from '../controllers/authController.js';

const loansRouter = Router();

loansRouter.post('/create-loan/:bookId', tokenValidation, createLoan);

loansRouter.use(tokenValidation);

loansRouter.get('/', getAllLoans);
loansRouter.get('/:id', getLoanById);

loansRouter.get('/user/loans', getLoansByUser);

loansRouter.patch('/update-loan/:id', updateLoan);
loansRouter.delete('/delete-loan/:id', deleteLoan);

loansRouter.patch('/retrieve-book/:id', retrieveBookFromLoan);

export default loansRouter;
