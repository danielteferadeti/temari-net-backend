import Joi, { ref } from "joi";
import { Schema, Document, model, Model } from "mongoose";
import User from "./user";
import Class from "./class";

export interface IIssue extends Document {
    user: Schema.Types.ObjectId
    class: Schema.Types.ObjectId
    title: string
    description: string
    archives: [Schema.Types.ObjectId]
    tags: [string]
    createdAt: Date
    updatedAt: Date
}


const IssueSchema: Schema<IIssue> = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: User
    },
    class: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: Class
    },
    title: {
        type: String,
        required: true
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
    tags: {
        type: [String],
        default: []
    },
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    })


const Issue = model<IIssue>('Issue', IssueSchema)
  
export const issueValidation = Joi.object<IIssue>({
    user: Joi.string().required(),
    class: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required().messages({
      'any.required': 'Description is required.',
    }),
    archives: Joi.array(),
    tags: Joi.array().items(Joi.string()),
})

export default Issue;