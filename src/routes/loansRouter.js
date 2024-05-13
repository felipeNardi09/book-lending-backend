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
import { tokenValidation } from '../middlewares/tokenValidation.js';
import { restrictTo } from '../middlewares/restrictTo.js';

const loansRouter = Router();

loansRouter.use(tokenValidation);

loansRouter.post('/create-loan/:bookId', createLoan);
loansRouter.patch('/retrieve-book/:id', retrieveBookFromLoan);
loansRouter.get('/:id', getLoanById);
loansRouter.get('/user/loans', getLoansByUser);

loansRouter.use(restrictTo);
loansRouter.get('/', getAllLoans);
loansRouter.patch('/update-loan/:id', updateLoan);
loansRouter.delete('/delete-loan/:id', deleteLoan);

export default loansRouter;
