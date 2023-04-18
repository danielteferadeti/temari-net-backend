import { Request, Response, NextFunction } from 'express';
import Answer, { IAnswer, answerValidation } from '../models/answer';
import Vote from '../models/vote';
import axios from 'axios';
import configs from '../config/configs';

export const getToken = (req: Request) => {
  let token = req.headers['authorization'] || req.body.token || req.headers.cookie?.split('=')[1] || req.cookies?.jwt;

  if (token) {
    const bearer = token.split(' ');
    if (bearer.length == 2) {
      token = bearer[1];
    } else {
      token = bearer[0];
    }
  }
  return token
}

export const sendRequest = async (req: Request, verb: string, modelName: string, id: string | null = null, body: object | null = null) => {
  let model = null;

  if (body) {
    if (verb == "put") {
      model = await axios.put(
        `${configs.SERVER_URL}${configs.PORT}/api/v1/${modelName}/${id}`,
        body,
        {
          headers: {
            'authorization': 'Bearer ' + getToken(req),
            'Content-Type': 'application/json'
          }
        }
      )
    } else if (verb == 'post') {
      model = await axios.post(
        `${configs.SERVER_URL}${configs.PORT}/api/v1/${modelName}`,
        body,
        {
          headers: {
            'authorization': 'Bearer ' + getToken(req),
            'Content-Type': 'application/json'
          }
        }
      )
      console.log(model)
    }

  } else {
    model = await axios.get(
      `${configs.SERVER_URL}${configs.PORT}/api/v1/user/currentUser`,
      {
        headers: {
          'authorization': 'Bearer ' + getToken(req),
          'Content-Type': 'application/json'
        }
      }
    );
    return model.data.data;
  }
  console.log(model)
  return model
}

export const getAnswerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const answer = await Answer.findById(id).populate([{path: 'userId'}, {path: "issueId"}, {path: "archives"}]);
    if (!answer) {
      res.status(404).json({ error: 'Answer not found', message: 'An Answer with the given Id doesn\'t exists'});
    } else {
      res.status(200).json({message: "Answer retrieved successfully", data: answer});
    }

  } catch (error) {
    res.status(500).json({ error: error.message, message: 'Internal Server Error' });

  }
};

export const getAllAnswers = async (req: Request, res: Response): Promise<void> => {
  try {
    const answers: IAnswer[] = await Answer.find().populate([{path: 'userId'}, {path: "issueId"}, {path: "archives"}]);
    res.status(200).json({message: "Answers retrieved successfully", data: answers});
  } catch (error) {
    res.status(500).json({ error: error.message, message: 'Internal Server Error' });

  }
};

export const createAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userId, issueId, description, archives, upVote, downVote } = req.body;
    const validateAnswer = await answerValidation.validateAsync({ userId, issueId, description, archives, upVote, downVote })
    let answer: IAnswer | null = await Answer.create({
      ...validateAnswer
    });
    answer = await answer.populate([{path: 'userId'}, {path: "issueId"}, {path: "archives"}]);
    res.status(200).json({message: "Answer created successfully", data: answer});
  } catch (error) {
    res.status(500).json({ error: error.message, message: 'Internal Server Error' });

  }
};


export const updateAnswerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const { userId, issueId, description, archives, upVote, downVote } = req.body;
    const validateAnswer = await answerValidation.validateAsync({ userId, issueId, description, archives, upVote, downVote })
    const answer: IAnswer = await Answer.findByIdAndUpdate( id,{...validateAnswer},{ new: true }).populate([{path: 'userId'}, {path: "issueId"}, {path: "archives"}]);
    res.status(200).json({message: "Answer updated successfully", data: answer});
  } catch (error) {
    res.status(500).json({ error: error.message, message: 'Internal Server Error' });
  }
};


export const deleteAnswerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params
    const answer: IAnswer = await Answer.findByIdAndDelete(id).populate([{path: 'userId'}, {path: "issueId"}, {path: "archives"}]);
    res.status(200).json({message: "Answer deleted successfully", data: answer});
  } catch (error) {
    res.status(500).json({ error: error.message, message: 'Internal Server Error' });

  }
};

export const downVote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { answerId } = req.params
    const user = await sendRequest(req, "get", "user");
    if (!user) {
      return res.status(404).send({ "error":"user not authenticated", "message": "Please singin first!" })
    }
    const userId = user._id;
    let vote = await Vote.findOne({ userId: userId, answerId: answerId }).lean().exec();
    let answer = await Answer.findById(answerId).lean().exec();
    if (!answer) {
      res.status(404).json({ error: 'Answer not found', message: 'An Answer with the given Id doesn\'t exists'});
    }

    let n_answer = null;
    if (!vote) {
      await sendRequest(req, "post", "vote", null, { userId: userId, answerId: answerId, value: -1 })
      n_answer = await sendRequest(req, "put", "answer", answerId, { ...answer, downVote: answer.downVote + 1 })
    } else if (vote.value == -1) {
      await sendRequest(req, "put", "vote", vote._id, { userId: userId, answerId: answerId, value: 0 })
      n_answer = await sendRequest(req, "put", "answer", answerId, { ...answer, downVote: answer.downVote - 1 })
    } else if (vote.value == 0) {
      await sendRequest(req, "put", "vote", vote._id, { userId: userId, answerId: answerId, value: -1 })
      n_answer = await sendRequest(req, "put", "answer", answerId, { ...answer, downVote: answer.downVote + 1 })
    } else if (vote.value == 1) {
      await sendRequest(req, "put", "vote", vote._id, { userId: userId, answerId: answerId, value: -1 })
      n_answer = await sendRequest(req, "put", "answer", answerId, { ...answer, downVote: answer.downVote + 1, upVote: answer.upVote - 1 })
    }
    console.log(answer)
    res.status(200).json({message: "Answer downVoted successfully", data: n_answer.data.data});
  } catch (error) {
    res.status(500).json({ error: error.message, message: 'Internal Server Error' });

  }
}

export const upVote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { answerId } = req.params
    const user = await sendRequest(req, "get", "user");

    if (!user) {
      return res.status(404).send({ "error":"user not authenticated", "message": "Please singin first!" })
    }
    const userId = user._id;
    let vote = await Vote.findOne({ userId: userId, answerId: answerId }).lean().exec();
    let answer = await Answer.findById(answerId).lean().exec();
    if (!answer) {
      res.status(404).json({ error: 'Answer not found', message: 'An Answer with the given Id doesn\'t exists'});
    }
  
    let n_answer = null;
    if (!vote) {
      await sendRequest(req, "post", "vote", null, { userId: userId, answerId: answerId, value: 1 })
      n_answer = await sendRequest(req, "put", "answer", answerId, { ...answer, upVote: answer.upVote + 1 })
    } else if (vote.value == 1) {
      await sendRequest(req, "put", "vote", vote._id, { userId: userId, answerId: answerId, value: 0 })
      n_answer = await sendRequest(req, "put", "answer", answerId, { ...answer, upVote: answer.upVote - 1 })
    } else if (vote.value == 0) {
      await sendRequest(req, "put", "vote", vote._id, { userId: userId, answerId: answerId, value: 1 })
      n_answer = await sendRequest(req, "put", "answer", answerId, { ...answer, upVote: answer.upVote + 1 })
    } else if (vote.value == -1) {
      await sendRequest(req, "put", "vote", vote._id, { userId: userId, answerId: answerId, value: 1 })
      n_answer = await sendRequest(req, "put", "answer", answerId, { ...answer, downVote: answer.downVote - 1, upVote: answer.upVote + 1 })
    }
    res.status(200).json({message: "Answer upVoted successfully", data: n_answer.data.data});
  } catch (error) {
    res.status(500).json({ error: error.message, message: 'Internal Server Error' });
  }
}


const answerControllers = { getAnswerById, getAllAnswers, createAnswer, updateAnswerById, deleteAnswerById, downVote, upVote }
export default answerControllers;