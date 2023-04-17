import Joi from "joi";
import { Schema, Document, model } from "mongoose";
import User from "./user";
import Issue from "./issue";

export interface IAnswer extends Document {
    user: Schema.Types.ObjectId
    issue: Schema.Types.ObjectId
    description: string
    archives: [Schema.Types.ObjectId]
    upVote: number
    downVote: number
    createdAt: Date
    updatedAt: Date
}


const AnswerSchema: Schema<IAnswer> = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: User
    },
    issue: {
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
        ref: 'File',
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
    user: Joi.string().required(),
    issue: Joi.string().required(),
    description: Joi.string().required().messages({
        'any.required': 'Description is required.',
    }),
    archives: Joi.array().items(Joi.string()),
    upVote: Joi.number(),
    downVote: Joi.number()
})

export default Answer;