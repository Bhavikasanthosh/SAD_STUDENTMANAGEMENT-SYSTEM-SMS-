const express = require("express");
 
const Student = require("../models/student");
 
const { verifyRole, restrictStudentToOwnData } = require("./auth/util");
const { ROLES } = require("../../consts");
const { log } = require("winston");
 
const router = express.Router();
 
//Post a new student here
router.post("/", async (req,res) => {
    const {name, email, password} =req.body
// const name = req.body.name;
// const email = req.body.email;
if (!name || !email || !password) {
    return res
    .status(400)
    .json({message: "Provide name, email, password"});
}
 
 
//Create Student
try {
    //Check if Student exists
    const existingStudent = await Student.findOne({email});
    if (existingStudent){
        return res.status(400).json({message: "Student already exists"});
    }
    const newStudent= new Student({ name, email, password});
    const savedStudent = await newStudent.save();
    return res.status(201).json({ message: "Student created successfully", student: savedStudent });
}
catch(error) {
    return res.status(500).json({message: "unable to create student", error: error.message});
}
 
});
 
// GET - Get all students
router.get("/", verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.AUTH_SERVICE,ROLES.ENROLLMENT_SERVICE]), async (req, res) => {
    try {
        const students = await Student.find();
        logger.info("fetched student using auth service"); //student fetched using auth service
        return res.status(200).json(students);
    } catch (error) {
        return res.status(500).json({ message: "Unable to find students", error: error.message });
    }
});
 
// GET - Get one student by ID
router.get("/:id", verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.STUDENT]),restrictStudentToOwnData, async (req, res) => {
    const { id } = req.params;
    try {
        const student = await Student.findById(id);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        return res.status(200).json(student);
    } catch (error) {
        return res.status(500).json({ message: "Error finding student",error: error.message });
    }
});
 
// PUT/PATCH - Update student by ID
router.put("/:id", verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.STUDENT]),restrictStudentToOwnData, async (req, res) => {
    const { id } = req.params;
    const { name, email, password } = req.body;
 
    try {
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            { name, email, password },
            { new: true, runValidators: true }
        );
        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        return res.status(200).json(updatedStudent);
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({ message: "Error updating student" });
    }
});
 
// PATCH - update particular field/Partial Update
router.patch("/:id",verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.STUDENT]),restrictStudentToOwnData, async (req, res) => {
    const { id } = req.params;
    try {
        const updatedStudent = await Student.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        return res.status(200).json(updatedStudent);
    } catch (error) {
        return res.status(500).json({ message: "Error updating student" });
    }
});
 
 
// DELETE - Remove student by ID
router.delete("/:id", verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.STUDENT]),restrictStudentToOwnData, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedStudent = await Student.findByIdAndDelete(id);
        if (!deletedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        return res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting student",error: error.message });
    }
});
 
 
module.exports = router;
 
 