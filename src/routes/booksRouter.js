import Router from 'express';
import {
    createBook,
    getAllBooks,
    getBookById,
    updateBook,
    deleteBook
} from '../controllers/booksControllers.js';
import { tokenValidation } from '../controllers/authController.js';

const booksRouter = Router();

booksRouter.post('/create-book', createBook);

booksRouter.get('/', getAllBooks);
booksRouter.get('/:id', getBookById);

booksRouter.patch('/:id', tokenValidation, updateBook);
booksRouter.delete('/delete-book/:id', tokenValidation, deleteBook);

//delete

export default booksRouter;
