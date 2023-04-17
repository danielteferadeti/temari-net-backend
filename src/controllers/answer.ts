import { Request, Response, NextFunction } from 'express';
import { Document } from 'mongoose';
import Answer, { IAnswer, answerValidation } from '../models/answer';
import Vote, { IVote } from '../models/vote';
import { createVote } from './vote';
import axios from 'axios';
import configs from '../config/configs';

export const getToken = (req: Request) => {
  let token = req.headers['authorization'] || req.body.token || req.headers.cookie?.split('=')[1] || req.cookies?.jwt;
  
  if (token) {
    const bearer = token.split(' ');
    if(bearer.length == 2){
      token = bearer[1];
    }else{
      token = bearer[0];
    }
  }
  return token
}

export const sendRequest = async (req: Request, verb: string, modelName: string, id: string|null = null, body: object|null = null)=>{
  let model = null;

  if (body){
    if (verb == "put"){
      model = await axios.put(
        `${configs.SERVER_URL}${configs.PORT}/api/v1/${modelName}/${id}`,
        body,
         { headers: {
          'authorization': 'Bearer ' + getToken(req),
          'Content-Type': 'application/json'
        }}
      )
    }else if (verb == 'post') {
      model = await axios.post(
        `${configs.SERVER_URL}${configs.PORT}/api/v1/${modelName}`,
        body,
         { headers: {
          'authorization': 'Bearer ' + getToken(req),
          'Content-Type': 'application/json'
        }}
      )
    }
    
  } else {
    model = await axios.get(
      `${configs.SERVER_URL}${configs.PORT}/api/v1/user/currentUser`,
      {headers: {
        'authorization': 'Bearer ' + getToken(req),
        'Content-Type': 'application/json'
      }}
      );
    return model.data.user;
  }
  return model
}

export const getAnswerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const answer = await Answer.findById(id);
    if (!answer) {
        res.status(404).json({ error: "Answer not found" })
    }else {
        res.status(201).json(answer);
    }
    
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAllAnswers = async (req: Request, res: Response): Promise<void> => {
  try {
      const answers: IAnswer[] = await Answer.find();
      res.status(201).json(answers);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, issueId, description, archives, upVote, downVote } = req.body;
    const validateAnswer = await answerValidation.validateAsync({ userId, issueId, description, archives, upVote, downVote })
    const answer: IAnswer | null = await Answer.create({
      ...validateAnswer
    });
    res.status(201).json(answer);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const updateAnswerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const { userId, issueId, description, archives, upVote, downVote } = req.body;
    const validateAnswer = await answerValidation.validateAsync({ userId, issueId, description, archives, upVote, downVote })
    const answer: IAnswer = await Answer.findByIdAndUpdate(
      id,
      {
        ...validateAnswer
      },
      { new: true }
    );
    res.status(200).json(answer);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const deleteAnswerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const answer: IAnswer = await Answer.findByIdAndDelete(id);
    res.status(200).json(answer);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const downVote = async (req: Request, res: Response, next: NextFunction)=> {
  try{
    const { answerId } = req.params
    const user = await sendRequest(req, "get", "user");
    if (!user) {
      return res.status(404).send({"message": "Please singin first!"})
    }
    const userId = user._id;
    let vote = await Vote.findOne({userId: userId, answerId: answerId}).lean().exec();
    let answer = await Answer.findById(answerId).lean().exec();
    if (!answer) {
      return res.status(404).send({"message": "Answer not found"})
    }

    let n_answer = null;
    if(!vote) {
      await sendRequest(req, "post", "vote", null, {userId: userId, answerId: answerId, value: -1})
      n_answer = await sendRequest(req, "put", "answer", answerId, {...answer, downVote: answer.downVote+1})
    }else if (vote.value == -1) {
      await sendRequest(req, "put", "vote", vote._id, {userId: userId, answerId: answerId, value: 0})
      n_answer =  await sendRequest(req, "put", "answer", answerId, {...answer, downVote: answer.downVote-1})
    }else if (vote.value == 0) {
      await sendRequest(req, "put", "vote", vote._id, {userId: userId, answerId: answerId, value: -1})
      n_answer = await sendRequest(req, "put", "answer", answerId, {...answer, downVote: answer.downVote+1})
    }else if (vote.value == 1) {
      await sendRequest(req, "put", "vote", vote._id, {userId: userId, answerId: answerId, value: -1})
      n_answer = await sendRequest(req, "put", "answer", answerId, {...answer, downVote: answer.downVote+1, upVote: answer.upVote-1})  
    }
    res.status(200).send(n_answer.data)
  }catch (err) {
    res.status(500).json({ error: err });
  }
}

export const upVote = async (req: Request, res: Response, next: NextFunction)=> {
  try{
    const { answerId } = req.params
    const user = await sendRequest(req, "get", "user");
    if (!user) {
      return res.status(404).send({"message": "Please singin first!"})
    }
    const userId = user._id;
    let vote = await Vote.findOne({userId: userId, answerId: answerId}).lean().exec();
    let answer = await Answer.findById(answerId).lean().exec();
    if (!answer) {
      return res.status(404).send({"message": "Answer not found"})
    }

    let n_answer = null;
    if(!vote) {
      await sendRequest(req, "post", "vote", null, {userId: userId, answerId: answerId, value: 1})
      n_answer = await sendRequest(req, "put", "answer", answerId, {...answer, upVote: answer.upVote+1})
    }else if (vote.value == 1) {
      await sendRequest(req, "put", "vote", vote._id, {userId: userId, answerId: answerId, value: 0})
      n_answer =  await sendRequest(req, "put", "answer", answerId, {...answer, upVote: answer.upVote-1})
    }else if (vote.value == 0) {
      await sendRequest(req, "put", "vote", vote._id, {userId: userId, answerId: answerId, value: 1})
      n_answer = await sendRequest(req, "put", "answer", answerId, {...answer, upVote: answer.upVote+1})
    }else if (vote.value == -1) {
      await sendRequest(req, "put", "vote", vote._id, {userId: userId, answerId: answerId, value: 1})
      n_answer = await sendRequest(req, "put", "answer", answerId, {...answer, downVote: answer.downVote-1, upVote: answer.upVote+1})  
    }
    res.status(200).send(n_answer.data)
  }catch (err) {
    res.status(500).json({ error: err });
  }
}


const answerControllers = { getAnswerById, getAllAnswers, createAnswer, updateAnswerById, deleteAnswerById, downVote, upVote }
export default answerControllers;