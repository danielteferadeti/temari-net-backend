// package all routes in a single file

import userRouter from "./user";
import classRouter from "./class";
import issueRouter from "./issue";
import voteRouter from "./vote";
import answerRouter from "./answer";

export default {
  userRouter,
  classRouter,
  issueRouter,
  voteRouter,
  answerRouter
};
