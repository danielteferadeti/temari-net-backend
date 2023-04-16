import { Request, Response } from 'express';
import { Document } from 'mongoose';
import Issue, { IIssue, issueValidation } from '../models/issue';

export const getIssues = async (req: Request, res: Response): Promise<void> => {
    try {
        const issues: Document<IIssue>[] = await Issue.find();
        res.json(issues);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const createIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, classId, title, description, attachments, tags } = req.body;
        const validatedIssue = await issueValidation.validateAsync({ userId, classId, title, description, attachments, tags });

        const issue: Document<IIssue> = await Issue.create({
            ...validatedIssue
        });
        res.json(issue);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
};

export const getIssueById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
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
        const { userId, classId, title, description, attachments, tags } = req.body;
        const validatedIssue = await issueValidation.validateAsync({ userId, classId, title, description, attachments, tags });

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
