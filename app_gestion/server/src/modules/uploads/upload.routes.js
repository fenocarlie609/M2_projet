// src/modules/uploads/upload.routes.js
const express = require("express");
const authMiddleware = require("../../common/middlewares/auth.middleware");
const { upload } = require("../../common/middlewares/upload.middleware");
const uploadController = require("./upload.controller");

const router = express.Router();

router.use(authMiddleware.protect);

// "avatar" doit correspondre au nom du champ utilisé côté front dans le FormData
router.post("/avatar", upload.single("avatar"), uploadController.uploadAvatar);

module.exports = router;
