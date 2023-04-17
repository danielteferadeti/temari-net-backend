import { Request, Response } from 'express';
import Issue, { IIssue, issueValidation } from '../models/issue';

export const getAllIssues = async (req: Request, res: Response): Promise<void> => {
    try {
        const issues: IIssue[] = await Issue.find().populate("user");
        res.status(200).json({message: "Issues retrieved successfully", data: issues});
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });
    }
};

export const createIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        let { userId, classId, title, description, archives, tags } = req.body;
        console.log(req.body)
        const validatedIssue = await issueValidation.validateAsync({ 
            userId, classId, title, description, archives, tags });
        
        const issue: IIssue = await Issue.create({
            ...validatedIssue
            
        });
        res.status(201).json({message: "Issue created successfully", data: issue});
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });
    }
};

export const getIssueById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const issue = await Issue.findById(id).populate({path: 'user'}).exec();
        if (!issue) {
            res.status(404).json({ error: 'Issue not found', message: 'An Issue with the given Id doesn\'t exists'});
        } else {
            res.status(200).json({message: "Issues retrieved successfully", data: issue});
        }
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });
    }
};

export const updateIssueById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { userId, classId, title, description, archives, tags } = req.body;
        const validatedIssue = await issueValidation.validateAsync({ userId, classId, title, description, archives, tags });

        const updatedIssue: IIssue | null = await Issue.findByIdAndUpdate(
            id,
            { ...validatedIssue },
            { new: true }
        );
        if (!updatedIssue) {
            res.status(404).json({ error: 'Issue not found', message: 'An Issue with the given Id doesn\'t exists'});
        } else {
            res.status(200).json({message: "Issues updated successfully", data: updatedIssue});
        }
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });
    }
};

export const deleteIssueById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedIssue: IIssue | null = await Issue.findByIdAndDelete(id);
        if (!deletedIssue) {
            res.status(404).json({ error: 'Issue not found', message: 'An Issue with the given Id doesn\'t exists'});
        } else {
            res.status(200).json({message: "Issues deleted successfully", data: deletedIssue});
        }
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });
    }
};

const issueControllers = {
    getAllIssues, getIssueById, createIssue, updateIssueById, deleteIssueById
}
export default issueControllers;