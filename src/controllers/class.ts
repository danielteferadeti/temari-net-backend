import { Request, Response } from 'express'

import Class, { IClass, classValidation } from '../models/class'
import User, { userValidation } from '../models/user'
import ClassMember, { classMemberValidation } from '../models/classmember'

const createClass = async (req, res) => {
    try {
      let { name, chatLink } = req.body;
      let owner = req.body.user._id.toString();
  
      const validatedClass = await classValidation.validateAsync({ name, chatLink, owner,});
  
      //check if class exists with name
      const classByName = await Class.findOne({ name: validatedClass.name }).lean().exec();
  
      //if user found return error
      if (classByName) {
        return res.status(400).json({ errors: "That name is already registered", message: "Must provide unique class name" }).end();
      }
  
      const new_class = await Class.create({...validatedClass});
  

      //finish registering the class || send success message
      return res.status(201).json({
        message: "Class created successfully!",
        data: new_class
      }).end();
    }
    catch (err) {
      if (err.isJoi === true) {
        return res.status(400).json({ error: err.details[0].message, message: err.details[0].message }).end();
      }
      return res.status(400).json({ error: "Wrong format of class info sent.", message: err.message }).end();
    }
  }

//Add member to class
const addClassMember = async (req, res) => {
    try {
      let { member } = req.body;
      let owner = req.body.user._id.toString();
  
      const foundClass = await Class.findOne({_id: req.params.id});

      if (!foundClass) {
        return res.status(400).json({ error: "Class does not exist!", message: "Could not find class by that ID."}).end();
      }

      if (foundClass.owner.toString() !== owner){
        return res.status(400).json({ error: "Class does not belong to you!", message: "You can't add a member to this class!"}).end();
      }

      //Check if members exists and add them to the class if they are not added already
      if (typeof member === "string"){
        member = member.trim()
        member = member.split(" ")
      }
      
      if (member) {
        let foundAndAdded = []
        let notAdded = []
        for (const _member of member) {
            const foundUser = await User.findOne({userName: _member}).lean().exec();

            if (!foundUser){
                notAdded.push(_member)
                continue
            }

            const alreadyAdded = await ClassMember.findOne({userId: foundUser._id, classId: foundClass._id}).lean().exec();

            if (alreadyAdded){
                notAdded.push(_member);
                continue
            }

            const addedMember = await ClassMember.create({userId: foundUser._id, classId: foundClass._id});
            if (addedMember){
                foundAndAdded.push(_member);
            }
        }

        return res.status(201).json({
            message: "Class members added successfully!",
            data: {
                added: foundAndAdded,
                notAdded: notAdded
            }
          }).end();
      }

      return res.status(400).json({ errors: "No member to add", message: "Make sure to send user names you would like to add to the class." }).end();
    }
    catch (err) {
      if (err.isJoi === true) {
        return res.status(400).json({ error: err.details[0].message, message: err.details[0].message }).end();
      }
      return res.status(400).json({ error: "Wrong format of info sent.", message: err.message }).end();
    }
  }

//Remove claa member
  const removeClassMember = async (req, res) => {
    try {
      let { userName } = req.body;
      userName = userName.trim()
      let owner = req.body.user._id.toString();

      const foundClass = await Class.findOne({_id: req.params.id});

      if (!foundClass) {
        return res.status(400).json({ error: "Class does not exist!", message: "Could not find class by that ID."}).end();
      }

      if (foundClass.owner.toString() !== owner){
        return res.status(400).json({ error: "Class does not belong to you!", message: "You can't remove a member from this class!"}).end();
      }

      const foundUser = await User.findOne({userName,}).lean().exec();

      if (!foundUser){
        return res.status(400).json({ error: "No user found by that userName!", message: "Make sure you have entered a valid userName!"}).end();
      }

      const isMember = await ClassMember.findOne({userId: foundUser._id, classId: foundClass._id}).lean().exec()

      if (!isMember){
        return res.status(400).json({ error: "user does not belong to this class!", message: "You can't remove a member that is not a member of the class!"}).end();
      }

      const removedMember = await ClassMember.findOneAndDelete({userId: foundUser._id, classId: foundClass._id});
      return res.status(201).json({
        message: "Class member removed successfully!",
        data: {
            removedUser: userName
        }
        }).end();

    }
    catch (err) {
      if (err.isJoi === true) {
        return res.status(400).json({ error: err.details[0].message, message: err.details[0].message }).end();
      }
      return res.status(400).json({ error: "Wrong format of info sent.", message: err.message }).end();
    }
  }



const ClassControllers = { createClass, addClassMember, removeClassMember }
export default ClassControllers