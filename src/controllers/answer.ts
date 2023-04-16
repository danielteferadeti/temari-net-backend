import { Request, Response, NextFunction } from 'express';
import { Document } from 'mongoose';
import Answer, { IAnswer, answerValidation } from '../models/answer';
import Vote from '../models/vote';


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
      const answers: Document<IAnswer>[] = await Answer.find();
      res.status(201).json(answers);
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const createAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, answerId, description, archives, upVote, downVote } = req.body;
    const validateAnswer = await answerValidation.validateAsync({ userId, answerId, description, archives, upVote, downVote })
    const answer: Document<IAnswer> | null = await Answer.create({
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
    const { userId, answerId, description, archives, upVote, downVote } = req.body;
    const validateAnswer = await answerValidation.validateAsync({ userId, answerId, description, archives, upVote, downVote })
    const answer: Document<IAnswer> = await Answer.findByIdAndUpdate(
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
    const answer: Document<IAnswer> = await Answer.findByIdAndDelete(id);
    res.status(200).json(answer);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const downVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try{
    const { answerId, userId } = req.params
    const vote = await Vote.findOne({userId: userId, answerId: answerId})
    if(!vote) {
      //TODO create the vote and make its value -1
    }else if (vote.value == 1) {
      //TODO update the vote and make its value -1
    }

    res.status(200).send({vote})
  }catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const upVote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try{
    const { answerId, userId } = req.params
    const vote = await Vote.findOne({userId: userId, answerId: answerId})
    if(!vote) {
      //TODO create the vote and make its value 1
    }else if (vote.value == 1) {
      //TODO update the vote and make its value 1
    }

    res.status(200).send({vote})
  }catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


const answerControllers = { getAnswerById, getAllAnswers, createAnswer, updateAnswerById, deleteAnswerById, downVote, upVote }
export default answerControllers;