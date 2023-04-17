import Joi from "joi";
import { Schema, Document, model } from "mongoose";

export interface IVote extends Document {
    userId: Schema.Types.ObjectId
    answerId: Schema.Types.ObjectId
    value: number
    createdAt: Date
    updatedAt: Date
}


const VoteSchema: Schema<IVote> = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    answerId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    value: {
        type: Number,
        required: true,
      },
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    })


const Vote = model<IVote>('Vote', VoteSchema)


  
export const voteValidation = Joi.object<IVote>({
    userId: Joi.string().required(),
    answerId: Joi.string().required(),
    value: Joi.number().required()
})

export default Vote;