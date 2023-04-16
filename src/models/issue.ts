import Joi from "joi";
import { Schema, Document, model, Model } from "mongoose";

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
        required: true
    },
    classId: {
        type: Schema.Types.ObjectId,
        required: true
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

const objectId = Joi.object({
    id: Joi.string().hex().length(24)
  })
  
export const issueValidation = Joi.object<IIssue>({
    userId: objectId.required(),
    classId: objectId.required(),
    title: Joi.string().required(),
    description: Joi.string().required().messages({
      'any.required': 'Description is required.',
    }),
    archives: Joi.array().items(objectId),
    tags: Joi.array().items(Joi.string()),
})

export default Issue;