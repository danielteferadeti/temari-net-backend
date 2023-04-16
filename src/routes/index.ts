// package all routes in a single file

import userRouter from "./user";
import issueRouter from "./issue";
import voteRouter from "./vote";
import answerRouter from "./answer";

export default {
  userRouter,
  issueRouter,
  voteRouter,
  answerRouter
};
