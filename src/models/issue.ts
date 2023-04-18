import Joi, { ref } from "joi";
import { Schema, Document, model, Model } from "mongoose";
import User from "./user";
import Class from "./class";
import File from "./files";

export interface IIssue extends Document {
    userId: Schema.Types.ObjectId
    classId: Schema.Types.ObjectId
    title: string
    description: string
    archives: [Schema.Types.ObjectId]
    tags: [string]
    createdAt: Date
    updatedAt: Date
}


const IssueSchema: Schema<IIssue> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: User
    },
    classId: {
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
        ref: File,
        default: null
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
    userId: Joi.string().required(),
    classId: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required().messages({
      'any.required': 'Description is required.',
    }),
    archives: Joi.array(),
    tags: Joi.array().items(Joi.string()),
})

export default Issue;