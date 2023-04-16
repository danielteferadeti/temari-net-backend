import Joi from "joi";
import { Schema, Document, model } from "mongoose";

export interface IAnswer extends Document {
    userId: Schema.Types.ObjectId
    answerId: Schema.Types.ObjectId
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
        required: true
    },
    answerId: {
        type: Schema.Types.ObjectId,
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

const objectId = Joi.object({
    id: Joi.string().hex().length(24)
})

export const answerValidation = Joi.object<IAnswer>({
    userId: objectId.required(),
    answerId: objectId.required(),
    description: Joi.string().required().messages({
        'any.required': 'Description is required.',
    }),
    archives: Joi.array().items(objectId),
    upVote: Joi.number(),
    downVote: Joi.number()
})

export default Answer;