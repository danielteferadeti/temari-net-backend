import Joi from "joi";
import { Schema, Document, model } from "mongoose";
import User from "./user";
import Issue from "./issue";
import File from "./files";

export interface IAnswer extends Document {
    userId: Schema.Types.ObjectId
    issueId: Schema.Types.ObjectId
    description: string
    archives: [Schema.Types.ObjectId]
    upVote: number
    downVote: number
    createdAt: Date
    updatedAt: Date
}


const AnswerSchema: Schema<IAnswer> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: User
    },
    issueId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: Issue
    },
    description: {
        type: String,
        required: [true, "Description is required."]
    },
    archives: {
        type: [Schema.Types.ObjectId],
        ref: File,
        default: null,
        required: false
    },
    upVote: {
        type: Number,
        required: true,
        default: 0
    },
    downVote: {
        type: Number,
        required: true,
        default: 0
    },
},
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    })


const Answer = model<IAnswer>('Answer', AnswerSchema)

export const answerValidation = Joi.object<IAnswer>({
    userId: Joi.string().required(),
    issueId: Joi.string().required(),
    description: Joi.string().required().messages({
        'any.required': 'Description is required.',
    }),
    archives: Joi.array().items(Joi.string()),
    upVote: Joi.number(),
    downVote: Joi.number()
})

export default Answer;