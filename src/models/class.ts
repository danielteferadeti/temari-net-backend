import mongoose, { Schema, Document, Model, model, ObjectId } from 'mongoose';
import Joi from 'joi';
import JoiObjectId from 'joi-objectid';


export interface IClass extends Document{
    name: String,
    owner: Schema.Types.ObjectId,
    chatLink: String,
    createdAt: Date
}

const classSchema: Schema<IClass> = new mongoose.Schema({
    name: {
        type: String,
        default: "File Name",
        required: [true, "class name is required"]
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: [true , "owner is required!"],
        ref:"User"
    },
    chatLink: {
        type: String,
        default: "This is were the chatLink goes."
    },
},
{
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
})

export const classValidation = Joi.object({
    name: Joi.string().required().trim(),
    owner: Joi.string().hex().length(24).required(),
    chatLink: Joi.string().trim()
  });

const Class = mongoose.model<IClass>('Class',classSchema)
export default Class