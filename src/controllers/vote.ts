import { Document } from 'mongoose';
import { Request, Response } from "express";
import Vote, { IVote, voteValidation } from '../models/vote';

export const createVote = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, answerId, value } = req.body;
        const vote: IVote = await Vote.create({
            userId, answerId, value
        })

        res.status(201).json({ vote: vote })
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getVoteById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const vote: IVote | null = await Vote.findById(id);

        if (!vote) {
            res.status(404).json({ error: "Vote not found" })
        } else {
            const data = {
                value: vote.value
            }

            res.status(200).json({ vote: data })
        }

    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export const getAllVotes = async (req: Request, res: Response): Promise<void> => {
    try {
        const votes: IVote[] | null = await Vote.find()

        if (!votes) {
            res.status(404).json({ error: 'No vote found' });
        } else {
            res.status(200).json({ votes: votes })
        }
    } catch (e) {
        res.status(500).json({ error: 'Internal Server Error' });
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
        );
        if (!updatedVote) {
            res.status(404).json({ error: 'Issue not found' });
        } else {
            res.json(updatedVote);
        }
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
}

export const deletVote = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedVote: IVote | null = await Vote.findByIdAndDelete(id);
        if (!deletedVote) {
            res.status(404).json({ error: 'Issue not found' });
        } else {
            res.json(deletedVote);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    
    }
}

const voteContollers = { getAllVotes, getVoteById, createVote, updateVote, deletVote };
export default voteContollers;