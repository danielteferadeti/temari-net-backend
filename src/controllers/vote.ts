import { Request, Response } from "express";
import Vote, { IVote, voteValidation } from '../models/vote';

export const createVote = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, answerId, value } = req.body;
        let vote: IVote = await Vote.create({
            userId, answerId, value
        })
        vote = await vote.populate([{path: 'userId'}, {path: "answerId"}]);
        res.status(201).json({message: "Vote created successfully", data: vote});
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });
    }
}

export const getVoteById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const vote: IVote | null = await Vote.findById(id).populate([{path: 'userId'}, {path: "answerId"}]);;

        if (!vote) {
            res.status(404).json({ error: 'Vote not found', message: 'A Vote with the given Id doesn\'t exists'});
        } else {
            res.status(200).json({message: "Vote retrived successfully", data: vote});
        }

    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });

    }
}

export const getAllVotes = async (req: Request, res: Response): Promise<void> => {
    try {
        const votes: IVote[] | null = await Vote.find().populate([{path: 'userId'}, {path: "answerId"}]);

        if (!votes) {
            res.status(404).json({ error: 'Vote not found', message: 'A Vote with the given Id doesn\'t exists'});
        } else {
            res.status(200).json({message: "Votes retrived successfully", data: votes});
        }
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });

    }
}

export const updateVote = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { userId, answerId, value } = req.body;
        const validatedVote = await voteValidation.validateAsync({ userId, answerId, value });

        const updatedVote: IVote | null = await Vote.findByIdAndUpdate(
            id,
            { ...validatedVote },
            { new: true }
        ).populate([{path: 'userId'}, {path: "answerId"}]);;
        if (!updatedVote) {
            res.status(404).json({ error: 'Vote not found', message: 'A Vote with the given Id doesn\'t exists'});
        } else {
            res.status(200).json({message: "Vote updated successfully", data: updatedVote});
        }
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });
    }
}

export const deletVote = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedVote: IVote | null = await Vote.findByIdAndDelete(id).populate([{path: 'userId'}, {path: "answerId"}]);;
        if (!deletedVote) {
            res.status(404).json({ error: 'Vote not found', message: 'A Vote with the given Id doesn\'t exists'});
        } else {
            res.status(200).json({message: "Vote Deleted successfully", data: deletedVote});
        }
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });
    }
}

const voteContollers = { getAllVotes, getVoteById, createVote, updateVote, deletVote };
export default voteContollers;