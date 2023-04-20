import express from 'express';
import commentContollers from '../controllers/comment'
import isAuthenticated from "../middlewares/authenticate"

const route = express.Router()

route.get('/', isAuthenticated, commentContollers.getAllComments)
route.get('/:id', isAuthenticated, commentContollers.getCommentById)
route.get('/answer-comments/:answerId', isAuthenticated, commentContollers.getCommentByAnswerId)
route.post('/', isAuthenticated, commentContollers.createComment)
route.put('/:id', isAuthenticated, commentContollers.updateComment)
route.delete('/:id', isAuthenticated, commentContollers.deleteComment)

export default route