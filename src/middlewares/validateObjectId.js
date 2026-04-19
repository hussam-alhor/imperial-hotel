const mongoose = require("mongoose");

// check Object Id 
module.exports.validateObjectId = (req , res , next)=> {
  if(!mongoose.Types.ObjectId.isValid(req.params.id)){
    return res.status(400).json({message : "invalid Id"})
  }
  next()
}