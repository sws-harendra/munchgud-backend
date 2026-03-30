const express = require("express");
const router = express.Router();
const db = require("../models");
const SocialLinks = db.SocialLinks;



// ✅ GET (fetch links)
router.get("/", async (req, res) => {
    try {
        const data = await SocialLinks.findOne();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching links" });
    }
});


// ✅ POST (create/update links)
router.post("/", async (req, res) => {
    try {
        const { instagram, facebook, twitter } = req.body;

        let data = await SocialLinks.findOne();

        if (data) {
            await data.update({ instagram, facebook, twitter });
        } else {
            data = await SocialLinks.create({ instagram, facebook, twitter });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ message: "Error saving links" });
    }
});

module.exports = router;