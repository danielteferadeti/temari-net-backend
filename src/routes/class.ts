import { Router } from "express";
import ClassControllers from "../controllers/class";
import isAuthenticated from "../middlewares/authenticate";
import multipleUpload from "../middlewares/multipleUpload";


const router = Router();

router.post("/createClass", isAuthenticated, ClassControllers.createClass);
router.post("/addMembers/:id", isAuthenticated, ClassControllers.addClassMember);
router.post("/removeMember/:id", isAuthenticated, ClassControllers.removeClassMember);
router.get("/classMembers/:id", isAuthenticated, ClassControllers.getClassMembers);
router.get("/myClasses", isAuthenticated, ClassControllers.getMyClasses);
router.post("/addEvent/:id", isAuthenticated, multipleUpload, ClassControllers.addEventToClass);
router.get("/classEvents/:id", isAuthenticated, ClassControllers.getClassEvents);
router.get("/allMyEvents", isAuthenticated, ClassControllers.getAllMyEvents);
router.post("/addAnnouncement/:id", isAuthenticated, multipleUpload, ClassControllers.addAnnouncementToClass);
router.get("/classAnnouncements/:id", isAuthenticated, ClassControllers.getClassAnnouncements);


export default router;