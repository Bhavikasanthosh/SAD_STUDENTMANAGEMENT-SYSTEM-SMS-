const express = require("express");
 
const Student = require("../models/student");
 
const { verifyRole, restrictStudentToOwnData } = require("./auth/util");
const { ROLES } = require("../../consts");
 
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
    return res.status(201).json(savedStudent);
}
catch(error) {
    return res.status(500).json({message: "unable to create student"});
}
 
});
 
// GET - Get all students
router.get("/", verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.AUTH_SERVICE]),
async (req, res) => {
    try {
        const students = await Student.find();
        return res.status(200).json(students);
    } catch (error) {
        return res.status(500).json({ message: "Unable to find students" });
    }
});
 
// GET - Get one student by email
router.get("/:email", verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.STUDENT]),
async (req, res) => {
    const {email} = req.params;
    try {
        const student = await Student.findOne({email});
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        return res.status(200).json(student);
    } catch (error) {
        return res.status(500).json({ message: "Unable to find student" });
    }
});
 
// PUT/PATCH - Update student by email
router.put("/:email", verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.STUDENT]),
async (req, res) => {
    const { email } = req.params;
    const { name, password } = req.body;
 
    if (!name || !password) {
        return res.status(400).json({ message: "Provide name and password to update" });
    }
 
    try {
        const updatedStudent = await Student.findOneAndUpdate(
            { email },
            { name, email, password },
            { new: true, runValidators: true }
        );
        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        return res.status(200).json(updatedStudent);
    } catch (error) {
        return res.status(500).json({ message: "Unable to update student" });
    }
});
 
// PATCH - update particular field/Partial Update
router.patch("/:email", async (req, res) => {
    const { email } = req.params;
    try {
        const updatedStudent = await Student.findOneAndUpdate(
            { email },
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!updatedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        return res.status(200).json(updatedStudent);
    } catch (error) {
        return res.status(500).json({ message: "Unable to update student" });
    }
});
 
 
// DELETE - Remove student by email
router.delete("/:email", verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.STUDENT]),
async (req, res) => {
    const { email } = req.params;
    try {
        const deletedStudent = await Student.findOneAndDelete({ email });
        if (!deletedStudent) {
            return res.status(404).json({ message: "Student not found" });
        }
        return res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Error deleting student" });
    }
});
 
 
module.exports = router;
 
 
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const axios = require("axios");
const { ROLES } = require("../../../consts");
 
dotenv.config();
 
async function fetchJWKS(jku) {}
 
function getPublicKeyFromJWKS(kid, keys) {
  const key = keys.find((k) => k.kid === kid);
 
  if (!key) {
    throw new Error("Unable to find a signing key that matches the 'kid'");
  }
 
  return `-----BEGIN PUBLIC KEY-----\n${key.n}\n-----END PUBLIC KEY-----`;
}
 
async function verifyJWTWithJWKS(token) {}
 
// Role-based Access Control Middleware
function verifyRole(requiredRoles) {
  return async (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token is missing" });
    }
    // TODO: Add role verification logic here
    next();
  };
}
 
function restrictStudentToOwnData(req, res, next) {}
 
module.exports = {
  verifyRole,
  restrictStudentToOwnData,
};
 
 