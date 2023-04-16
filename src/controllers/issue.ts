import { Request, Response } from 'express';
import { Document } from 'mongoose';
import Issue, { IIssue, issueValidation } from '../models/issue';

export const getAllIssues = async (req: Request, res: Response): Promise<void> => {
    try {
        const issues: Document<IIssue>[] = await Issue.find();
        res.status(201).json(issues);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, classId, title, description, archives, tags } = req.body;
        const validatedIssue = await issueValidation.validateAsync({ userId, classId, title, description, archives, tags });

        const issue: Document<IIssue> = await Issue.create({
            ...validatedIssue
        });
        res.status(201).json(issue);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

export const getIssueById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const issue: Document<IIssue> | null = await Issue.findById(id);
        if (!issue) {
            res.status(404).json({ error: 'Issue not found' });
        } else {
            res.json(issue);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const updateIssueById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { userId, classId, title, description, archives, tags } = req.body;
        const validatedIssue = await issueValidation.validateAsync({ userId, classId, title, description, archives, tags });

        const updatedIssue: Document<IIssue> | null = await Issue.findByIdAndUpdate(
            id,
            { ...validatedIssue },
            { new: true }
        );
        if (!updatedIssue) {
            res.status(404).json({ error: 'Issue not found' });
        } else {
            res.json(updatedIssue);
        }
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

export const deleteIssueById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedIssue: Document<IIssue> | null = await Issue.findByIdAndDelete(id);
        if (!deletedIssue) {
            res.status(404).json({ error: 'Issue not found' });
        } else {
            res.json(deletedIssue);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const issueControllers = {
    getAllIssues, getIssueById, createIssue, updateIssueById, deleteIssueById
}
export default issueControllers;