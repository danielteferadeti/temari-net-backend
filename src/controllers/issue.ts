import { Request, Response } from 'express';
import Issue, { IIssue, issueValidation } from '../models/issue';
import Fav, { IFav, favValidation } from '../models/favoriteIssue';
import { sendRequest } from './answer';

export const getAllIssues = async (req: Request, res: Response) =>{
    try {
        const issues = await Issue.find().populate([{path: 'userId'}, {path: "classId"}, {path: "archives"}]).lean().exec();
        const user = await sendRequest(req, "get", "user");
        // console.log(user)
        let n_issues = [];
        // console.log(req.body)
        for (const issue of issues) {
            try {
                let isFavorite = await Fav.findOne({"userId": user._id, "issueId": issue.id}).lean().exec()? true : false;
                const temp_issue = {...issue, isFavorite: isFavorite};
                // console.log(temp_issue, "temp");
                n_issues.push(temp_issue);
            } catch (error) {
                return res.status(400).json({ error: error.message, message: 'Error while checking favorite issues'});
            }
        }
        res.status(200).json({message: "Issues retrieved successfully", data: n_issues});
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });
    }
};

export const createIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        let { userId, classId, title, description, archives, tags } = req.body;
        const validatedIssue = await issueValidation.validateAsync({ 
            userId, classId, title, description, archives, tags });
        
        let issue: IIssue = await Issue.create({
            ...validatedIssue 
        })
        issue = await issue.populate([{path: 'userId'}, {path: "classId"}, {path: "archives"}])
        res.status(201).json({message: "Issue created successfully", data: issue});
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });
    }
};

export const getIssueById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        let issue = await Issue.findById(id).populate([{path: 'userId'}, {path: "classId"}, {path: "archives"}]).lean().exec();
        const user = await sendRequest(req, "get", "user");
        let isFavorite = await Fav.findOne({"userId": user._id, "issueId":id}).lean().exec()? true:false;
        
        if (!issue) {
            res.status(404).json({ error: 'Issue not found', message: 'An Issue with the given Id doesn\'t exists'});
        } else {
            const n_issue = {...issue, isFavorite: isFavorite}
            res.status(200).json({message: "Issues retrieved successfully", data:n_issue});
        }
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });
    }
};

export const getIssueByTag = async (req: Request, res: Response): Promise<void> => {
    try {
        const { tags } = req.body;
        const issue = await Issue.find({ tags: { $in: tags } }).populate([{path: 'userId'}, {path: "classId"}, {path: "archives"}]).exec();
        if (!issue) {
            res.status(404).json({ error: 'Issue not found', message: 'An Issue with the given tags doesn\'t exists'});
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
        ).populate([{path: 'userId'}, {path: "classId"}, {path: "archives"}]).exec();
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

export const manageFavorite = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, issueId } = req.body;
        let favorite = await Fav.findOne({"userId": userId, "issueId":issueId}).lean().exec();
        if (!favorite) {
            const validatedFavorite = await favValidation.validateAsync({ 
                userId, issueId });
                // console.log(validatedFavorite)
            let n_favorite: IFav = await Fav.create({
                ...validatedFavorite
            });
            
            n_favorite = await n_favorite.populate([{path: 'userId'}, {path: "issueId"}])
            res.status(201).json({message: "Issue added to favorite list successfully", data: n_favorite});
        }else{
            await Fav.findOneAndDelete({"userId": userId, "issueId":issueId});
            res.status(201).json({message: "Issue removed from favorite list successfully", data: favorite});
        }
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });
    }
};

export const getFavoriteIssue = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const favorites = await Fav.find({ "userId": userId}).populate([{path: 'userId'}, {path: "issueId"}]).lean().exec();
        if (!favorites) {
            res.status(404).json({ error: 'No favorite issue found', message: 'The user doesn\'t have any favorite issue'});
        } else {
            const issues = favorites.map((fav) => fav.issueId);
            res.status(200).json({message: "Favorite Issues retrieved successfully", data: issues});
        }
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });
    }
};

const issueControllers = {
    getAllIssues, getIssueById, getIssueByTag, createIssue, updateIssueById, deleteIssueById, getFavoriteIssue, manageFavorite
}
export default issueControllers;