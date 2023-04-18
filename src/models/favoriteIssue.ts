import Joi from "joi";
import { Schema, Document, model } from "mongoose";
import User from "./user";
import Issue from "./issue";

export interface IFav extends Document {
    userId: Schema.Types.ObjectId
    issueId: Schema.Types.ObjectId
    createdAt: Date
    updatedAt: Date
}


const FavoriteIssueSchema: Schema<IFav> = new Schema({
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
    },
    {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    })


const Fav = model<IFav>('Fav', FavoriteIssueSchema)

export const favValidation = Joi.object<IFav>({
    userId: Joi.string().required(),
    issueId: Joi.string().required(),
})

export default Fav;