import Router from 'express';
import {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook
} from '../controllers/booksControllers.js';
import { tokenValidation } from '../middlewares/tokenValidation.js';
import { restrictTo } from '../middlewares/restrictTo.js';

const booksRouter = Router();

booksRouter.get('/', getAllBooks);
booksRouter.get('/:id', getBookById);

booksRouter.use(tokenValidation, restrictTo);

booksRouter.post('/create-book', createBook);
booksRouter.patch('/:id', updateBook);
booksRouter.delete('/delete-book/:id', deleteBook);

//delete

export default booksRouter;
