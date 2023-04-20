import express from 'express';
import voteContollers from '../controllers/vote'
import isAuthenticated from "../middlewares/authenticate"

const route = express.Router()

route.get('/', isAuthenticated, voteContollers.getAllVotes)
route.get('/:id', isAuthenticated, voteContollers.getVoteById)
route.post('/', isAuthenticated, voteContollers.createVote)
route.put('/:id', isAuthenticated, voteContollers.updateVote)
route.delete('/:id', isAuthenticated, voteContollers.deletVote)

export default route