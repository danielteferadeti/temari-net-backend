import mongoose, { Schema, Document, Model, model, ObjectId } from 'mongoose';
import Joi from 'joi';

export interface IEvent extends Document{
    userId: Schema.Types.ObjectId,
    classId: Schema.Types.ObjectId
    title: String,
    description: String,
    startTime: String,
    endTime: String
}

const eventSchema: Schema<IEvent> = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: [true, "user Id is required"],
        ref: "User"
    },
    classId: {
        type: Schema.Types.ObjectId,
        required: [true, "class is is required"],
        ref: "User"
    },
    title: {
        type: String,
        required: [true, "title is required"]
    },
    description: {
        type: String,
        default: "Your description should go here!"
    },
    startTime: {
        type: String
    },
    endTime: {
        type: String
    },
},
{
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
})

export const classValidation = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    classId: Joi.string().hex().length(24).required(),
    title: Joi.string().required().trim(),
    description: Joi.string().trim(),
    startTime: Joi.string().trim(),
    endTime: Joi.string().trim()
  });

const Event = mongoose.model<IEvent>('Class',eventSchema)
export default Event