import { Schema, Document, Model, model, ObjectId } from 'mongoose';
import * as bcrypt from "bcrypt";
import Joi from 'joi';

export interface IUserDocument extends Document {
  userName: string
  name: string
  email: string
  bio: string
  department: string
  year: string
  country: string
  avatar: Schema.Types.ObjectId
  password: string
  favoriteTags: [string]
  resetToken: string
  createdAt: Date
  updatedAt: Date
}

interface UserModel extends Model<IUserDocument>{
  login(email: string, password: string): any
}

const UserSchema: Schema<IUserDocument, UserModel> = new Schema(
  {
    email: {
      type: String,
      required: [true, "email is required"],
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
   },
   userName: {
    type: String,
    unique: true,
    required: [true, 'Please enter a userName!']
    },
    name: {
      type: String,
      required: [true, 'Please enter a your full name!']
    },
    password: {
      type: String,
      required: [true, 'Please enter a password'],
      minlength: [6, 'Minimum password length is 6 characters'],
    },
    bio: {
      type: String,
      default: "Your bio goes here."
    },
    department: {
      type: String,
      default: "Your department goes here."
    },
    year: {
      type: String,
      default: "Your year goes here."
    },
    country: {
      type: String,
      default: "Your country goes here."
    },
    avatar: {
      type: Schema.Types.ObjectId,
      ref:"File",
      default: "63f73594ba3c0813a218ff2e"
    },
    favoriteTags: {
      type: [String],
      default: []
    },
    resetToken: {
      type: String,
      default: ""
    },
  },
  {
    timestamps: {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    },
    populate: {
      path: 'avatar',
      model: 'File'
    },
  }
)

// fire a function before user is saved to db
UserSchema.pre('save', async function(next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// static method to login a user
UserSchema.statics.login = async function(email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error('incorrect password');
  }
  throw Error('incorrect email');
};


const User = model<IUserDocument, UserModel>('User', UserSchema)

export const userValidation = Joi.object({
  email: Joi.string().min(6).required().email().trim().lowercase(),
  password: Joi.string().min(6).required().trim(),
  userName: Joi.string().trim().alphanum().pattern(/^[^\s]+$/).required(),
  name: Joi.string().required().trim(),
  bio: Joi.string().default("Your bio goes here.").trim(),
  department: Joi.string().default("Your department goes here.").trim(),
  year: Joi.string().default("Your year goes here.").trim(),
  country: Joi.string().default("Your country goes here.").trim(),
  avatar: Joi.string().hex().length(24),
  favoriteTags: Joi.array().max(5),
  resetToken: Joi.string().default("")
});

export default User
