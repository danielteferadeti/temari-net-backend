import Joi from "joi";
import { Schema, Document, model } from "mongoose";
import User from "./user";
import Answer from "./answer";

export interface IComment extends Document {
    userId: Schema.Types.ObjectId
    answerId: Schema.Types.ObjectId
    content: string
    createdAt: Date
    updatedAt: Date
}


const CommentSchema: Schema<IComment> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: User
    },
    answerId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: Answer
    },
    content: {
        type: String,
        required: [true, "Content is required."]
    }
},
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    })


const Comment = model<IComment>('Comment', CommentSchema)

export const commentValidation = Joi.object<IComment>({
    userId: Joi.string().required(),
    answerId: Joi.string().required(),
    content: Joi.string().required().messages({
        'any.required': 'Content is required.',
    })
})

export default Comment;