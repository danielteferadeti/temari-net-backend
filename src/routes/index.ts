// package all routes in a single file

import userRouter from "./user";
import issueRouter from "./issue";

export default {
  userRouter,
  issueRouter
};
