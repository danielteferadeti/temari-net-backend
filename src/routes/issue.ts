import express from 'express';
import issueController from '../controllers/issue';
import isAuthenticated from "../middlewares/authenticate";
import multipleUpload from "../middlewares/multipleUpload";
import isAuthorized from '../middlewares/autherization';

const router = express.Router();


router.get('/', issueController.getAllIssues);
router.get('/:id', issueController.getIssueById);
router.post('/', isAuthenticated, multipleUpload, issueController.createIssue);
router.put('/:id', isAuthenticated, multipleUpload, isAuthorized.isIssueOwner, issueController.updateIssueById);
router.delete('/:id', isAuthenticated, issueController.deleteIssueById);

export default router;
