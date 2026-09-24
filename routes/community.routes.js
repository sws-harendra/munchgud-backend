const express = require("express");
const router = express.Router();
const communityController = require("../controllers/community.controller");
const { upload } = require("../helpers/multer");

// ==========================================
// 1. PUBLIC STOREFRONT ROUTES
// ==========================================
router.get("/page-data", communityController.getCommunityPageData);
router.post("/discussions/:id/vote", communityController.upvoteDiscussion);

// ==========================================
// 2. DISCUSSIONS MANAGEMENT (ADMIN)
// ==========================================
router.get("/admin/discussions", communityController.getAllDiscussionsAdmin);
router.post(
  "/admin/discussions",
  upload.single("authorAvatar"),
  communityController.createDiscussion
);
router.put(
  "/admin/discussions/:id",
  upload.single("authorAvatar"),
  communityController.updateDiscussion
);
router.patch(
  "/admin/discussions/:id/status",
  communityController.toggleDiscussionStatus
);
router.patch(
  "/admin/discussions/:id/pinned",
  communityController.toggleDiscussionPinned
);
router.delete("/admin/discussions/:id", communityController.deleteDiscussion);

// ==========================================
// 3. CREATORS SPOTLIGHT (ADMIN)
// ==========================================
router.get("/admin/creators", communityController.getAllCreatorsAdmin);
router.post(
  "/admin/creators",
  upload.single("img"),
  communityController.createCreator
);
router.put(
  "/admin/creators/:id",
  upload.single("img"),
  communityController.updateCreator
);
router.patch(
  "/admin/creators/:id/status",
  communityController.toggleCreatorStatus
);
router.delete("/admin/creators/:id", communityController.deleteCreator);

// ==========================================
// 4. TOP CONTRIBUTORS (ADMIN)
// ==========================================
router.get("/admin/contributors", communityController.getAllContributorsAdmin);
router.post(
  "/admin/contributors",
  upload.single("avatar"),
  communityController.createContributor
);
router.put(
  "/admin/contributors/:id",
  upload.single("avatar"),
  communityController.updateContributor
);
router.patch(
  "/admin/contributors/:id/status",
  communityController.toggleContributorStatus
);
router.delete(
  "/admin/contributors/:id",
  communityController.deleteContributor
);

// ==========================================
// 5. COMMUNITY SETTINGS (HERO & STATS)
// ==========================================
router.get("/admin/settings", communityController.getSettings);
router.put(
  "/admin/settings",
  upload.single("heroImage"),
  communityController.updateSettings
);

// ==========================================
// 6. TOPICS (ADMIN)
// ==========================================
router.get("/admin/topics", communityController.getAllTopicsAdmin);
router.post("/admin/topics", communityController.createTopic);
router.put("/admin/topics/:id", communityController.updateTopic);
router.patch("/admin/topics/:id/status", communityController.toggleTopicStatus);
router.delete("/admin/topics/:id", communityController.deleteTopic);

module.exports = router;
