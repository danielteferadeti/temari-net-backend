import mongoose, { Schema, Document, Model, model, ObjectId } from 'mongoose';
import Joi from 'joi';

export interface IEvent extends Document{
    userId: Schema.Types.ObjectId,
    classId: Schema.Types.ObjectId
    title: String,
    description: String,
    googleMeetLink: String,
    attachments: Schema.Types.ObjectId[],

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

        ref: "Class"
    },
    title: {
        type: String,
        required: [true, "title is required"]
    },
    description: {
        type: String,
        default: "Your description should go here!"
    },

    googleMeetLink: {
        type: String,
        default: "Your google Meet link should go here!"
    },
    attachments:{
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'File'
          }],
        default: []
    },
    startTime: {
        type: String,
        default: "Event start time"
    },
    endTime: {
        type: String,
        default: "Event end time"

    },
},
{
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
})

export const eventValidation = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    classId: Joi.string().hex().length(24).required(),
    title: Joi.string().required().trim(),
    description: Joi.string().trim(),

    googleMeetLink: Joi.string().trim(),
    attachments: Joi.array().max(5),

    startTime: Joi.string().trim(),
    endTime: Joi.string().trim()
  });

const Event = mongoose.model<IEvent>('Event',eventSchema)

export default Event