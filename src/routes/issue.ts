import express from 'express';
import issueController from '../controllers/issue';
import isAuthenticated from "../middlewares/authenticate";
import multipleUpload from "../middlewares/multipleUpload";
import isAuthorized from '../middlewares/autherization';

const router = express.Router();


router.get('/', isAuthenticated, issueController.getAllIssues);
router.get('/by-tag', isAuthenticated, issueController.getIssueByTag);
router.get('/:id', isAuthenticated, issueController.getIssueById);
router.get("/favorite-issues/:userId", isAuthenticated, issueController.getFavoriteIssue)
router.post('/manage-favorite', isAuthenticated, issueController.manageFavorite)
router.post('/', isAuthenticated, multipleUpload, issueController.createIssue);
router.put('/:id', isAuthenticated, multipleUpload, isAuthorized.isIssueOwner, issueController.updateIssueById);
router.delete('/:id', isAuthenticated, issueController.deleteIssueById);

export default router;
