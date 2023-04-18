import express from 'express';
import commentContollers from '../controllers/comment'
import isAuthenticated from "../middlewares/authenticate"

const route = express.Router()

route.get('/', commentContollers.getAllComments)
route.get('/:id', commentContollers.getCommentById)
route.get('/answer-comments/:answerId', commentContollers.getCommentByAnswerId)
route.post('/', isAuthenticated, commentContollers.createComment)
route.put('/:id', isAuthenticated, commentContollers.updateComment)
route.delete('/:id', isAuthenticated, commentContollers.deleteComment)

export default route