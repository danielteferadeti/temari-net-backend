import express from 'express';
import answerController from '../controllers/answer';
import isAuthenticated from "../middlewares/authenticate";
import multipleUpload from "../middlewares/multipleUpload";

const router = express.Router();


router.get('/', answerController.getAllAnswers);
router.get('/:id', answerController.getAnswerById);
router.post('/', isAuthenticated, multipleUpload, answerController.createAnswer);
router.put('/:id', isAuthenticated, answerController.updateAnswerById);
router.delete('/:id', isAuthenticated, answerController.deleteAnswerById);
router.post('/downvote/:answerId', isAuthenticated, answerController.downVote);
router.post('/upvote/:answerId', isAuthenticated, answerController.upVote);

export default router;
