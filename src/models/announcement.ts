import mongoose, { Schema, Document, Model, model, ObjectId } from 'mongoose';
import Joi from 'joi';

export interface IAnnouncement extends Document{
    userId: Schema.Types.ObjectId,
    classId: Schema.Types.ObjectId
    title: String,
    description: String,
    googleMeetLink: String,
    attachments: String[],
}

const announcementSchema: Schema<IAnnouncement> = new mongoose.Schema({
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
        type: [String],
        default: []
    }
},
{
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
})

export const announcementValidation = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    classId: Joi.string().hex().length(24).required(),
    title: Joi.string().required().trim(),
    description: Joi.string().trim(),
    googleMeetLink: Joi.string().trim(),
    attachments: Joi.array().max(5)
  });

const Announcement = mongoose.model<IAnnouncement>('Announcement',announcementSchema)
export default Announcement