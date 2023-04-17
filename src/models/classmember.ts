import mongoose, { Schema, Document, Model, model, ObjectId } from 'mongoose';
import Joi from 'joi';

export interface IClassMember extends Document{
    userId: Schema.Types.ObjectId,
    classId: Schema.Types.ObjectId
}

const classMemberSchema: Schema<IClassMember> = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: [true, "user Id is required"],
        ref: "User"
    },
    classId: {
        type: Schema.Types.ObjectId,
        required: [true, "class is is required"],
        ref: "Class"
    }
},
{
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
})

export const classMemberValidation = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    classId: Joi.string().hex().length(24).required()
  });

const ClassMember = mongoose.model<IClassMember>('ClassMember',classMemberSchema)
export default ClassMember