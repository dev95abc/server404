import express from "express";
import {
getAllUniversities,
getUniversityById,
createUniversity,
updateUniversity,
deleteUniversity,
} from "../controller/university.controller";

const router = express.Router();


router.get("/", (req, res) => getAllUniversities(req, res));
// router.get("/:id", (req, res) => getUniversityById(req, res));
router.post("/", (req, res) => createUniversity(req, res));
router.put("/:id", (req, res) => updateUniversity(req, res));
router.delete("/:id", (req, res) => deleteUniversity(req, res));

export default router;