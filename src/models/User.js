const mongoose = require("mongoose")
const joi = require("joi");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true,
        minlength : 2,
        maxlength : 100,
    },
    email :{
        type: String,
        required:true,
        trim:true,
        minlength : 6,
        maxlength : 100,
        unique : true
    },
    password : {
        type: String,
        required:true,
        trim:true,
        minlength : 8,
    },
   
     role:{
        type : String,
        enum: [ 'Employee', 'Admin'],
        default : "Employee"
    },
},{ 
    timestamps : true ,
    toJSON: {virtuals: true},
    toObject: {virtuals:true}
})


// generate auth token 
userSchema.methods.generateAuthToken = function(){
 return jwt.sign({id : this._id , role : this.role} , process.env.JWT_SECRET)
}

// Pre-save hook to hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await argon2.hash(this.password);
});

// user model
const User = mongoose.model('User' , userSchema)

// validate register
const validationRegisterUser = (obj)=> {
  const schema = joi.object({
    userName: joi.string().required().min(2).max(100).trim(),
    email: joi.string().required().min(6).max(100).trim().email(),
    password: joi.string().required().min(8).trim(),
  })
  return schema.validate(obj)
}
// validate logIn
const validationLoginUser = (obj)=> {
  const schema = joi.object({ 
    email: joi.string().required().min(6).max(100).trim().email(),
    password: joi.string().required().min(8).trim(),
  })
  return schema.validate(obj)
}

// validate update user
const validationUpdateUser = (obj)=>{
    const schema = joi.object({
        userName : joi.string().trim().min(2).max(100),
        password : joi.string().trim().min(8)
    })
    return schema.validate(obj)
}
module.exports = {
    User ,
    validationLoginUser ,
    validationRegisterUser ,
    validationUpdateUser
}