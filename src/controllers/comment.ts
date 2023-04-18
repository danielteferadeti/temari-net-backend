import { Request, Response } from "express";
import Comment, { IComment, commentValidation } from '../models/comment';

export const createComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, answerId, content } = req.body;
        let comment: IComment = await Comment.create({
            userId, answerId, content
        })
        comment = await comment.populate([{path: 'userId'}, {path: "answerId"}]);
        res.status(201).json({message: "Comment created successfully", data: comment});
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });
    }
}

export const getCommentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const comment: IComment | null = await Comment.findById(id).populate([{path: 'userId'}, {path: "answerId"}]);;

        if (!comment) {
            res.status(404).json({ error: 'Comment not found', message: 'A Comment with the given Id doesn\'t exists'});
        } else {
            res.status(200).json({message: "Comment retrived successfully", data: comment});
        }

    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });

    }
}

export const getCommentByAnswerId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { answerId } = req.params
        const comments: IComment[] | null = await Comment.find({answerId: answerId}).populate([{path: 'userId'}, {path: "answerId"}]);

        if (!comments) {
            res.status(404).json({ error: 'Comment not found', message: 'No Comment with the given answer Id'});
        } else {
            res.status(200).json({message: "Comments retrived successfully", data: comments});
        }

    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });

    }
}

export const getAllComments = async (req: Request, res: Response): Promise<void> => {
    try {
        const comments: IComment[] | null = await Comment.find().populate([{path: 'userId'}, {path: "answerId"}]);

        if (!comments) {
            res.status(404).json({ error: 'Comment not found', message: 'A Comment with the given Id doesn\'t exists'});
        } else {
            res.status(200).json({message: "Comments retrived successfully", data: comments});
        }
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });

    }
}

export const updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { userId, answerId, content } = req.body;
        const validatedComment = await commentValidation.validateAsync({ userId, answerId, content });

        const updatedComment: IComment | null = await Comment.findByIdAndUpdate(
            id,
            { ...validatedComment },
            { new: true }
        ).populate([{path: 'userId'}, {path: "answerId"}]);;
        if (!updatedComment) {
            res.status(404).json({ error: 'Comment not found', message: 'A Comment with the given Id doesn\'t exists'});
        } else {
            res.status(200).json({message: "Comment updated successfully", data: updatedComment});
        }
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });
    }
}

export const deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const deletedComment: IComment | null = await Comment.findByIdAndDelete(id).populate([{path: 'userId'}, {path: "answerId"}]);;
        if (!deletedComment) {
            res.status(404).json({ error: 'Comment not found', message: 'A Comment with the given Id doesn\'t exists'});
        } else {
            res.status(200).json({message: "Comment Deleted successfully", data: deletedComment});
        }
    } catch (error) {
        res.status(500).json({ error: error.message, message: 'Internal Server Error' });
    }
}

const commentContollers = { getAllComments, getCommentById, getCommentByAnswerId ,createComment, updateComment, deleteComment };
export default commentContollers;