import { BadRequestException } from "../Utils/Errors/exception.error.js"

export const validation = (schema) =>{
    return (req,res,next) =>{
            const validationResult = schema.safeParse({body : req.body , params : req.params , query : req.query})
    if (!validationResult.success) {
  const errors = validationResult.error.issues.map((issue) => ({
    in: issue.path[0],
    field:
      issue.code === "unrecognized_keys"
        ? issue.keys.join(", ")
        : issue.path.slice(1).join("."),
    message: issue.message,
  }));

  throw new BadRequestException("Validation Error", errors, "VALIDATION_ERROR");
}
req.validate = validationResult.data
    next();
    };
};