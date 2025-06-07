const express = require("express");

const Enrollment = require("../models/enrollment");

const router = express.Router();

const {
  verifyRole,
  restrictStudentToOwnData,
  fetchStudents,
  fetchCourses,
} = require("./auth/util");
const { ROLES } = require("../../consts");

// Create a new enrollment
router.post(
  "/",
  verifyRole([ROLES.ADMIN, ROLES.PROFESSOR]),
  async (req, res) => {
    try {
      const { student, course } = req.body;

      // Ensure both student and course IDs are provided
      if (!student || !course) {
        return res
          .status(400)
          .json({ message: "Student and Course are required" });
      }
        //check for student
        const students = await fetchStudents();
        const existingStudent = students.find((s)=> s._id === student);
        if(!existingStudent) {
          return res.status(400).json({message: " student not found"});
        }

        //check for courses
        const courses = await fetchCourses();
        const existingCourse = courses.find((c)=> c._id === course);
        if(!existingCourse) {
          return res.status(400).json({message: " course not found"});
        }
        //create an enrollment
        const enrollment= new Enrollment({student,course});
        await enrollment.save();

        res.status(201).json({
          message: "Enrollment created successfully",
          enrollment,
        });
     } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "Server Error: Unable to create enrollment",
      });
    }
  }
);
// Get all enrollments
router.get(
  "/",
  verifyRole([ROLES.ADMIN, ROLES.PROFESSOR]),
  async (req, res) => {
    try {
      let enrollments = await Enrollment.find().populate("student", "name email").populate("course", "title description");
      res.status(200).json(enrollments);
    } catch (error) {
      res.status(500).json({
        message: "Server Error: Unable to fetch enrollments",
      });
    }
  }
);

// Get a specific enrollment by ID
router.get(
  "/:id",
  verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.STUDENT]),
  async (req, res) => {
    try {

      const id = req.params.id;
      const enrollment = await Enrollment.findById(id).populate("course","name description");
      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      if (req.user.roles.includes(ROLES.STUDENT) && enrollment.student.toString() !== req.user.id) {
             return res.status(403).json({ message: "Access forbidden: You can only view your own enrollments." });
        }
 
        return res.status(200).json(enrollment);
    } catch (error) {
      console.error("Error fetching enrollment by ID:", error);
       if (error.kind === 'ObjectId') {
            return res.status(400).json({ message: "Invalid enrollment ID format" });
      }
      res.status(500).json({
        message: "Server Error: Unable to fetch enrollment",
        error: error.message
      });
    }
  }
);

// Get enrollment by student ID
router.get(
  "/student/:id",
  verifyRole([ROLES.ADMIN, ROLES.PROFESSOR, ROLES.STUDENT]),
  restrictStudentToOwnData,
  async (req, res) => {
    try {
      let enrollments = await Enrollment.find({student: req.params.id,}).populate("course", "title description");

      if (!enrollments.length) {
        return res
          .status(404)
          .json({ message: "No enrollments found for this student" });
      }

      // const courses = await fetchCourses();
      // enrollments = enrollments.map((enrollment) => {
      //   const enrollmentObj = enrollment.toObject(); // Convert to plain object if it's a Mongoose document
      //   const course = courses.find(
      //     (course) => course._id.toString() === enrollmentObj.course.toString()
      //   );
      //   if (course) {
      //     enrollmentObj.course = course; // Replace course ID with the full course object
      //   }
      //   return enrollmentObj;
      // });

      res.status(200).json(enrollments);
    } catch (error) {
      res.status(500).json({
        message: "Server Error: Unable to fetch enrollments for student",
      });
    }
  }
);

// Get enrollment by course ID
router.get(
  "/course/:id",
  verifyRole([ROLES.ADMIN, ROLES.PROFESSOR]),
  async (req, res) => {
    try {
      //TODO
      const courseId = req.params.id;
      let enrollments = await Enrollment.find({course: req.params.id,}).populate("student", "name email");
      if (!enrollments) {
        return res.status(404).json({ message: "No enrollments found for this course" });
      }
      res.status(200).json(enrollments);
    } catch (error) {
      res.status(500).json({
        message: "Server Error: Unable to fetch enrollments for course",
      });
    }
  }
);

// Delete an enrollment by ID
router.delete(
  "/:id",
  verifyRole([ROLES.ADMIN, ROLES.PROFESSOR,ROLES.STUDENT]),
  async (req, res) => {
    try {
      const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

      if (!enrollment) {
        return res.status(404).json({ message: "Enrollment not found" });
      }
      if( req.user.roles.includes(ROLES.STUDENT) && enrollment.student.toString() !== req.user.id) {
        return res.status(403).json({ message: "Access forbidden: You can only delete your own enrollments." });
      }
      await enrollment.findByIdAndDelete(req.params.id);

      res
        .status(200)
        .json({ message: "Enrollment deleted successfully", enrollment });
    } catch (error) {
      if (error.kind === "ObjectId") {
        return res
          .status(400)
          .json({ message: "Invalid enrollment ID format" });
      }
      res.status(500).json({
        message: "Server Error: Unable to delete enrollment",
      });
    }
  }
);

module.exports = router;
