import Joi from "joi";
import { Schema, Document, model } from "mongoose";
import User from "./user";
import Class from "./class";

export interface IVote extends Document {
    user: Schema.Types.ObjectId
    answer: Schema.Types.ObjectId
    value: number
    createdAt: Date
    updatedAt: Date
}


const VoteSchema: Schema<IVote> = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: User
    },
    answer: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: Class
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
    user: Joi.string().required(),
    answer: Joi.string().required(),
    value: Joi.number().required()
})

export default Vote;