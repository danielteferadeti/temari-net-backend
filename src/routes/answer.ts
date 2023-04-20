import express from 'express';
import answerController from '../controllers/answer';
import isAuthenticated from "../middlewares/authenticate";
import multipleUpload from "../middlewares/multipleUpload";
import isAuthorized from '../middlewares/autherization';

const router = express.Router();


router.get('/', isAuthenticated, answerController.getAllAnswers);
router.get('/:id', isAuthenticated, answerController.getAnswerById);
router.get("/by-issue/:issueId", isAuthenticated, answerController.getAnswerByIssueId);
router.post('/', isAuthenticated, multipleUpload, answerController.createAnswer);
router.put('/:id',  multipleUpload, answerController.updateAnswerById);
router.delete('/:id', isAuthenticated, isAuthorized.isAnswerOwner, answerController.deleteAnswerById);
router.post('/downvote/:answerId', isAuthenticated, answerController.downVote);
router.post('/upvote/:answerId',  isAuthenticated, answerController.upVote);

export default router;
