import { Router } from "express";
import ClassControllers from "../controllers/class";
import isAuthenticated from "../middlewares/authenticate";
// import multipleUpload from "../middlewares/multipleUpload";

const router = Router();

router.post("/createClass", isAuthenticated, ClassControllers.createClass);
router.post("/addMembers/:id", isAuthenticated, ClassControllers.addClassMember);
router.post("/removeMember/:id", isAuthenticated, ClassControllers.removeClassMember);



export default router;