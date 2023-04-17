import {Request,Response,NextFunction } from "express"
import Issue, { IIssue } from "../models/issue"
import Answer from "../models/answer";

const isIssueOwner= async (req:Request,res:Response,next:NextFunction)=>{
    try{
        let {user = null} = req.body
        const issue = await Issue.findById(req.params.id).lean().exec();
        if ((user._id).equals(issue.userId)){
            next()
            return
        }
        else{
            return res.status(403).json({message:"user not authorized"})
        }
    }
    catch(error){
        return res.status(403).json({message:"user not authorized"})
    }
    return

}

const isAnswerOwner= async (req:Request,res:Response,next:NextFunction)=>{
    try{
        let {user = null} = req.body
        const answer = await Answer.findById(req.params.id).lean().exec();
        if ((user._id).equals(answer.userId)){
            next()
            return
        }
        else{
            return res.status(403).json({message:"user not authorized"})
        }
    }
    catch(error){
        return res.status(403).json({message:"user not authorized"})
    }
    return

}

const isAuthorized = { isIssueOwner, isAnswerOwner }
export default isAuthorized;