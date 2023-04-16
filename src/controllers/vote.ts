import { Document } from 'mongoose';
import { Request, Response } from "express";
import Vote, { IVote } from '../models/vote';

export const createVote = async (req: Request, res: Response): Promise<void> => {
    try {
        const vote: Document<IVote> = await Vote.create({
            value: req.body.val,
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
        res.status(500).end()
    }
}

export const getAllVotes = async (req: Request, res: Response): Promise<void> => {
    try {
        const votes: Document<IVote>[] | null = await Vote.find()

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
        const { id } = req.params
        const vote = {
            value: req.body.val
        }
        const changeVote = await Vote.findByIdAndUpdate(id, vote, { new: true })
        if (!changeVote) {
            res.status(404).json({ error: 'No vote found' });
        } else {
            res.status(200).json({ vote: changeVote })
        }

    } catch (error) {
        res.status(500).json({ error: error });
    }
}

export const deletVote = async (req: Request, res: Response): Promise<void> => {
    try {
        await Vote.findByIdAndRemove(req.params.voteID).then(() => {
            res.status(200).json({
                message: "Vote deleted successfully"
            });
        }).catch((error: Error) => {
            res.status(404).json({
                error: error
            });
        });
    } catch (error) {
        res.status(500).json({ error: error });
    }
}

const voteContollers = { getAllVotes, getVoteById, createVote, updateVote, deletVote };
export default voteContollers;