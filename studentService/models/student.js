const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define the Student Schema
const studentSchema = new mongoose.Schema({             //used to define a structure - schema
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
         type: String,
         required: true,
         unique: true,
         lower: true,
    },
    password: {
         type: String,
         required: true,
         minLength: 6,
    },
});

//pre-save hook to hash the password before saving
studentSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next(); 

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
        } catch(error) {
            next (error);
        }
});
// Create the Student model
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
