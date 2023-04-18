import { Request, Response } from 'express'

import Class, { IClass, classValidation } from '../models/class'
import User, { userValidation } from '../models/user'
import ClassMember, { classMemberValidation } from '../models/classmember'

import Event, { eventValidation } from '../models/event'
import Announcement, { announcementValidation } from '../models/announcement'

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

      const addedMember = await ClassMember.create({userId: owner, classId: new_class._id});


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

      return res.status(400).json({ error: "No member to add", message: "Make sure to send user names you would like to add to the class." }).end();

    }
    catch (err) {
      if (err.isJoi === true) {
        return res.status(400).json({ error: err.details[0].message, message: err.details[0].message }).end();
      }
      return res.status(400).json({ error: "Wrong format of info sent.", message: err.message }).end();
    }
  }

//Remove class member
  const removeClassMember = async (req, res) => {
    try {
      let { userName } = req.body;

      if (!userName || userName == "") {
        return res.status(400).json({ error: "userName should be passed!", message: "Could not add member to a class"}).end();
      }
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

//Get class members
const getClassMembers = async (req, res) => {
  try {
    let owner = req.body.user._id.toString();

    const foundClass = await Class.findOne({_id: req.params.id});

    if (!foundClass) {
      return res.status(400).json({ error: "Class does not exist!", message: "Could not find class by that ID."}).end();
    }

    const isMember = await ClassMember.findOne({userId: owner, classId: foundClass._id}).lean().exec();

    if (foundClass.owner.toString() !== owner && !isMember){
      return res.status(400).json({ error: "You dare not added to this class yet!", message: "You can't see members from this class!"}).end();
    }

    const classMembers = await ClassMember.find({classId: foundClass._id}).populate("userId").populate("classId").lean().exec();
    return res.status(201).json({
      message: "Class members retrieved successfully!",
      data: classMembers
      }).end();
  }
  catch (err) {
    if (err.isJoi === true) {
      return res.status(400).json({ error: err.details[0].message, message: err.details[0].message }).end();
    }
    return res.status(400).json({ error: "Wrong format of info sent.", message: err.message }).end();
  }
}


//Get class members
const getMyClasses = async (req, res) => {
  try {
    let owner = req.body.user._id.toString();

    const onesAmMemberOf = await ClassMember.find({userId: owner}).populate("classId").lean().exec();
    return res.status(201).json({
      message: "Classes retrieved successfully!",
      data: onesAmMemberOf
      }).end();
  }
  catch (err) {
    if (err.isJoi === true) {
      return res.status(400).json({ error: err.details[0].message, message: err.details[0].message }).end();
    }
    return res.status(400).json({ error: "Wrong format of info sent.", message: err.message }).end();
  }
}

//Add Event to class
const addEventToClass = async (req, res) => {
  try {
    let {title,description,googleMeetLink,startTime,endTime }  = req.body;

    let owner = req.body.user._id.toString();

    const foundClass = await Class.findOne({_id: req.params.id});

    if (!foundClass) {
      return res.status(400).json({ error: "Class does not exist!", message: "Could not find class by that ID."}).end();
    }

    if (foundClass.owner.toString() !== owner){
      return res.status(400).json({ error: "Class does not belong to you!", message: "You can't add an Event to this class!"}).end();
    }

    let attachments = req.body.archives

    const validatedEvent = await eventValidation.validateAsync({ userId: owner, classId:req.params.id, title, description, googleMeetLink, attachments,startTime, endTime});
    const newEvent = await Event.create({...validatedEvent});

    return res.status(201).json({
        message: "Event added to a class successfully!",
        data: newEvent
      }).end();
  } catch (err) {
    if (err.isJoi === true) {
      return res.status(400).json({ error: err.details[0].message, message: err.details[0].message }).end();
    }
    return res.status(400).json({ error: "Wrong format of info sent.", message: err.message }).end();
  }
}


//Get class Events
const getClassEvents = async (req, res) => {
  try {
    let owner = req.body.user._id.toString();

    const foundClass = await Class.findOne({_id: req.params.id});

    if (!foundClass) {
      return res.status(400).json({ error: "Class does not exist!", message: "Could not find class by that ID."}).end();
    }

    const isMember = await ClassMember.findOne({userId: owner, classId: foundClass._id}).lean().exec();

    if (foundClass.owner.toString() !== owner && !isMember){
      return res.status(400).json({ error: "You are not added to this class yet!", message: "You can't see Events from this class!"}).end();
    }

    const classEvents = await Event.find({classId: foundClass._id}).populate("userId").populate("classId").lean().exec();
    return res.status(201).json({
      message: "Class events retrieved successfully!",
      data: classEvents
      }).end();
  }
  catch (err) {
    if (err.isJoi === true) {
      return res.status(400).json({ error: err.details[0].message, message: err.details[0].message }).end();
    }
    return res.status(400).json({ error: "Wrong format of info sent.", message: err.message }).end();
  }
}

//Add Announcement to class
const addAnnouncementToClass = async (req, res) => {
  try {
    let {title,description,googleMeetLink }  = req.body;

    let owner = req.body.user._id.toString();

    const foundClass = await Class.findOne({_id: req.params.id});

    if (!foundClass) {
      return res.status(400).json({ error: "Class does not exist!", message: "Could not find class by that ID."}).end();
    }

    if (foundClass.owner.toString() !== owner){
      return res.status(400).json({ error: "Class does not belong to you!", message: "You can't add an Event to this class!"}).end();
    }

    let attachments = req.body.archives

    const validatedAnnouncement = await announcementValidation.validateAsync({ userId: owner, classId:req.params.id, title, description, googleMeetLink, attachments});
    const newAnnouncement = await Announcement.create({...validatedAnnouncement});

    return res.status(201).json({
        message: "Announcement added to a class successfully!",
        data: newAnnouncement
      }).end();
  } catch (err) {
    if (err.isJoi === true) {
      return res.status(400).json({ error: err.details[0].message, message: err.details[0].message }).end();
    }
    return res.status(400).json({ error: "Wrong format of info sent.", message: err.message }).end();
  }
}

//Get class Announcements
const getClassAnnouncements = async (req, res) => {
  try {
    let owner = req.body.user._id.toString();

    const foundClass = await Class.findOne({_id: req.params.id});

    if (!foundClass) {
      return res.status(400).json({ error: "Class does not exist!", message: "Could not find class by that ID."}).end();
    }

    const isMember = await ClassMember.findOne({userId: owner, classId: foundClass._id}).lean().exec();

    if (foundClass.owner.toString() !== owner && !isMember){
      return res.status(400).json({ error: "You are not added to this class yet!", message: "You can't see Announcements from this class!"}).end();
    }

    const classAnnouncements = await Announcement.find({classId: foundClass._id}).populate("userId").populate("classId").lean().exec();
    return res.status(201).json({
      message: "Class Announcement retrieved successfully!",
      data: classAnnouncements
      }).end();
  }
  catch (err) {
    if (err.isJoi === true) {
      return res.status(400).json({ error: err.details[0].message, message: err.details[0].message }).end();
    }
    return res.status(400).json({ error: "Wrong format of info sent.", message: err.message }).end();
  }
}

//Get class Announcements
const getAllMyEvents = async (req, res) => {
  try {
    let  cur_user = req.body.user._id.toString();

    const {inputDate} = req.query;

    //Get all the classes cur user is in
    const allClasses = await ClassMember.find({userId: cur_user}).lean().exec();
    //get all Events in those class
    let allEvents = []

    for (let idx=0; idx<allClasses.length; idx++){
      let cur_class = allClasses[idx].classId;
      //find all events of cur class
      let allEventsOfCurClass = await Event.find({classId: cur_class}).populate("classId").populate("attachments").lean().exec();

      allEvents.push(...allEventsOfCurClass);
      }

    //filter the Events if inputDate is given
    if (!inputDate || inputDate==""){
      return res.status(201).json({
        message: "All Events retrieved successfully!",
        data: allEvents
        }).end();
    }
    
    allEvents = allEvents.filter(curEvent => curEvent.startTime === inputDate);

    return res.status(201).json({
      message: "All Events retrieved successfully!",
      data: allEvents
      }).end();
  }
  catch (err) {
    if (err.isJoi === true) {
      return res.status(400).json({ error: err.details[0].message, message: err.details[0].message }).end();
    }
    return res.status(400).json({ error: "Wrong format of info sent.", message: err.message }).end();
  }
}

const ClassControllers = { createClass, addClassMember, removeClassMember, getClassMembers,getMyClasses,addEventToClass, getClassEvents, addAnnouncementToClass, getClassAnnouncements, getAllMyEvents}
export default ClassControllers