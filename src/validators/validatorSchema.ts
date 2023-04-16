import Joi from "joi";

const requiredRule = {post:(schema)=> schema.required(),put:(schema=> schema.optional())}