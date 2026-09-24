const {
  CommunityDiscussion,
  CommunityCreator,
  CommunityContributor,
  CommunitySetting,
  CommunityTopic,
} = require("../models");

// Default seed data
const initialDiscussions = [
  {
    title: "Which Flazo earbuds are best for workouts?",
    desc: "I'm looking for something comfortable, durable and with good bass. Any suggestions from your experience?",
    author: "Rohit Sharma",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    category: "Product Help",
    tag: "help",
    votes: 286,
    comments: 42,
    views: "1.3K",
    time: "2h ago",
    status: "active",
    isPinned: true,
  },
  {
    title: "Tips to get the best battery life out of your Flazo earbuds",
    desc: "Here are some simple tips that have worked for me. Feel free to add more!",
    author: "Sneha Verma",
    authorAvatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
    category: "Tips & Tricks",
    tag: "tips",
    votes: 194,
    comments: 28,
    views: "980",
    time: "5h ago",
    status: "active",
    isPinned: false,
  },
  {
    title: "Flazo Nirvana Gold Pro X vs Flazo Air — Which one to choose?",
    desc: "Comparing sound quality, ANC, battery and comfort. Let's discuss!",
    author: "Arjun Mehta",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    category: "General",
    tag: "lifestyle",
    votes: 152,
    comments: 37,
    views: "2.4K",
    time: "1d ago",
    status: "active",
    isPinned: false,
  },
  {
    title: "Share your Flazo setup! 🎧",
    desc: "Post your photos and tell us how you use your Flazo in your daily life.",
    author: "Karan Patel",
    authorAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    category: "Lifestyle",
    tag: "lifestyle",
    votes: 97,
    comments: 64,
    views: "1.8K",
    time: "1d ago",
    status: "active",
    isPinned: false,
  },
  {
    title: "Feature Request: Multi-device pairing",
    desc: "It would be amazing to have seamless switching between laptop and phone!",
    author: "Aditi Singh",
    authorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    category: "Feature Request",
    tag: "requests",
    votes: 89,
    comments: 21,
    views: "760",
    time: "3d ago",
    status: "active",
    isPinned: false,
  },
];

const initialCreators = [
  {
    handle: "@tanya_music",
    role: "Music Creator",
    img: "/images/community_ambassador_creator.jpg",
    displayOrder: 1,
    status: "active",
  },
  {
    handle: "@rohit_audio",
    role: "Tech Reviewer",
    img: "/images/community_ambassador_dj.jpg",
    displayOrder: 2,
    status: "active",
  },
  {
    handle: "@kabir_explorer",
    role: "Explorer",
    img: "/images/community_ambassador_fitness.jpg",
    displayOrder: 3,
    status: "active",
  },
  {
    handle: "@priya_art",
    role: "Digital Artist",
    img: "/images/community_ambassador_gamer.jpg",
    displayOrder: 4,
    status: "active",
  },
];

const initialContributors = [
  {
    rank: 1,
    name: "Rohit Sharma",
    points: "1.2K points",
    role: "Sound Expert",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    badgeClass: "gold",
    status: "active",
  },
  {
    rank: 2,
    name: "Sneha Verma",
    points: "980 points",
    role: "Top Helper",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
    badgeClass: "silver",
    status: "active",
  },
  {
    rank: 3,
    name: "Arjun Mehta",
    points: "870 points",
    role: "Tech Enthusiast",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    badgeClass: "bronze",
    status: "active",
  },
  {
    rank: 4,
    name: "Karan Patel",
    points: "650 points",
    role: "Community Star",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    badgeClass: "star",
    status: "active",
  },
  {
    rank: 5,
    name: "Aditi Singh",
    points: "520 points",
    role: "Creative Listener",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    badgeClass: "star",
    status: "active",
  },
];

const initialTopics = [
  {
    topicId: "help",
    title: "Product Help",
    desc: "Get solutions",
    icon: "Headphones",
    displayOrder: 1,
    status: "active",
  },
  {
    topicId: "tips",
    title: "Tips & Tricks",
    desc: "Maximize your experience",
    icon: "Lightbulb",
    displayOrder: 2,
    status: "active",
  },
  {
    topicId: "lifestyle",
    title: "Music & Lifestyle",
    desc: "Vibe that fits you",
    icon: "Music",
    displayOrder: 3,
    status: "active",
  },
  {
    topicId: "requests",
    title: "Feature Requests",
    desc: "Help us improve",
    icon: "Sliders",
    displayOrder: 4,
    status: "active",
  },
  {
    topicId: "events",
    title: "Events",
    desc: "Offline & online",
    icon: "Calendar",
    displayOrder: 5,
    status: "active",
  },
  {
    topicId: "creators",
    title: "Creators",
    desc: "Talk, collaborate, grow",
    icon: "Users",
    displayOrder: 6,
    status: "active",
  },
];

const seedCommunityIfEmpty = async () => {
  try {
    const settingCount = await CommunitySetting.count();
    if (settingCount === 0) {
      await CommunitySetting.create({
        heroTag: "// FLAZO COMMUNITY",
        heroTitle: "Not Just Listeners. A Community That Feels.",
        heroSubtitle:
          "Connect. Share. Learn. Create. Grow. Because better sound brings better people together.",
        heroImage: "/images/flazo_community_hero_hq.jpg",
        membersCount: "25K+",
        discussionsCount: "10K+",
        answersCount: "500+",
        expertsCount: "50+",
        memberQuote:
          "Flazo community feels like a family. It's amazing to see real people talking, helping and vibing over something we all love — music.",
        quoteAuthor: "Neha P., Community Member",
      });
    }

    const discCount = await CommunityDiscussion.count();
    if (discCount === 0) {
      await CommunityDiscussion.bulkCreate(initialDiscussions);
    }

    const creatorCount = await CommunityCreator.count();
    if (creatorCount === 0) {
      await CommunityCreator.bulkCreate(initialCreators);
    }

    const contributorCount = await CommunityContributor.count();
    if (contributorCount === 0) {
      await CommunityContributor.bulkCreate(initialContributors);
    }

    const topicCount = await CommunityTopic.count();
    if (topicCount === 0) {
      await CommunityTopic.bulkCreate(initialTopics);
    }
  } catch (err) {
    console.error("Error seeding initial community data:", err);
  }
};

// Seed on module load
seedCommunityIfEmpty();

// ==========================================
// 1. PUBLIC STOREFRONT ENDPOINT
// ==========================================
exports.getCommunityPageData = async (req, res) => {
  try {
    await seedCommunityIfEmpty();

    const [settings, discussions, creators, contributors, topics] =
      await Promise.all([
        CommunitySetting.findOne(),
        CommunityDiscussion.findAll({
          where: { status: "active" },
          order: [
            ["isPinned", "DESC"],
            ["createdAt", "DESC"],
          ],
        }),
        CommunityCreator.findAll({
          where: { status: "active" },
          order: [["displayOrder", "ASC"]],
        }),
        CommunityContributor.findAll({
          where: { status: "active" },
          order: [["rank", "ASC"]],
        }),
        CommunityTopic.findAll({
          where: { status: "active" },
          order: [["displayOrder", "ASC"]],
        }),
      ]);

    res.json({
      settings: settings || {
        heroTag: "// FLAZO COMMUNITY",
        heroTitle: "Not Just Listeners. A Community That Feels.",
        heroSubtitle:
          "Connect. Share. Learn. Create. Grow. Because better sound brings better people together.",
        heroImage: "/images/flazo_community_hero_hq.jpg",
        membersCount: "25K+",
        discussionsCount: "10K+",
        answersCount: "500+",
        expertsCount: "50+",
        memberQuote:
          "Flazo community feels like a family. It's amazing to see real people talking, helping and vibing over something we all love — music.",
        quoteAuthor: "Neha P., Community Member",
      },
      discussions,
      creators,
      contributors,
      topics,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch community data", error: err.message });
  }
};

exports.upvoteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { delta } = req.body; // 1 or -1
    const disc = await CommunityDiscussion.findByPk(id);
    if (!disc) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const change = Number(delta) || 1;
    disc.votes = Math.max(0, disc.votes + change);
    await disc.save();

    res.json({ message: "Vote updated", discussion: disc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to vote", error: err.message });
  }
};

// ==========================================
// 2. DISCUSSIONS MANAGEMENT (ADMIN)
// ==========================================
exports.getAllDiscussionsAdmin = async (req, res) => {
  try {
    const discussions = await CommunityDiscussion.findAll({
      order: [
        ["isPinned", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
    res.json(discussions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch discussions", error: err.message });
  }
};

exports.createDiscussion = async (req, res) => {
  try {
    const {
      title,
      desc,
      author,
      authorAvatar,
      category,
      tag,
      votes,
      comments,
      views,
      time,
      isPinned,
      status,
    } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    let avatar = authorAvatar || null;
    if (req.file) {
      avatar = `/uploads/${req.file.filename}`;
    }

    const discussion = await CommunityDiscussion.create({
      title,
      desc,
      author: author || "Team Flazo",
      authorAvatar: avatar,
      category: category || "General",
      tag: tag || category?.toLowerCase() || "general",
      votes: Number(votes) || 0,
      comments: Number(comments) || 0,
      views: views || "0",
      time: time || "Just now",
      isPinned: isPinned === "true" || isPinned === true,
      status: status || "active",
    });

    res.status(201).json(discussion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create discussion", error: err.message });
  }
};

exports.updateDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const disc = await CommunityDiscussion.findByPk(id);
    if (!disc) {
      return res.status(404).json({ message: "Discussion not found" });
    }

    const {
      title,
      desc,
      author,
      authorAvatar,
      category,
      tag,
      votes,
      comments,
      views,
      time,
      isPinned,
      status,
    } = req.body;

    if (title !== undefined) disc.title = title;
    if (desc !== undefined) disc.desc = desc;
    if (author !== undefined) disc.author = author;
    if (category !== undefined) disc.category = category;
    if (tag !== undefined) disc.tag = tag;
    if (votes !== undefined) disc.votes = Number(votes) || 0;
    if (comments !== undefined) disc.comments = Number(comments) || 0;
    if (views !== undefined) disc.views = views;
    if (time !== undefined) disc.time = time;
    if (isPinned !== undefined) disc.isPinned = isPinned === "true" || isPinned === true;
    if (status !== undefined) disc.status = status;

    if (req.file) {
      disc.authorAvatar = `/uploads/${req.file.filename}`;
    } else if (authorAvatar !== undefined) {
      disc.authorAvatar = authorAvatar;
    }

    await disc.save();
    res.json(disc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update discussion", error: err.message });
  }
};

exports.toggleDiscussionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const disc = await CommunityDiscussion.findByPk(id);
    if (!disc) return res.status(404).json({ message: "Discussion not found" });

    disc.status = disc.status === "active" ? "inactive" : "active";
    await disc.save();
    res.json({ message: "Status updated", discussion: disc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle status", error: err.message });
  }
};

exports.toggleDiscussionPinned = async (req, res) => {
  try {
    const { id } = req.params;
    const disc = await CommunityDiscussion.findByPk(id);
    if (!disc) return res.status(404).json({ message: "Discussion not found" });

    disc.isPinned = !disc.isPinned;
    await disc.save();
    res.json({ message: "Pinned status updated", discussion: disc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle pin", error: err.message });
  }
};

exports.deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const disc = await CommunityDiscussion.findByPk(id);
    if (!disc) return res.status(404).json({ message: "Discussion not found" });

    await disc.destroy();
    res.json({ message: "Discussion deleted successfully", id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete discussion", error: err.message });
  }
};

// ==========================================
// 3. CREATOR SPOTLIGHT MANAGEMENT (ADMIN)
// ==========================================
exports.getAllCreatorsAdmin = async (req, res) => {
  try {
    const creators = await CommunityCreator.findAll({
      order: [["displayOrder", "ASC"]],
    });
    res.json(creators);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch creators", error: err.message });
  }
};

exports.createCreator = async (req, res) => {
  try {
    const { handle, role, img: explicitImg, displayOrder, status } = req.body;
    if (!handle || !role) {
      return res.status(400).json({ message: "Handle and role are required" });
    }

    let img = explicitImg || "/images/community_ambassador_creator.jpg";
    if (req.file) {
      img = `/uploads/${req.file.filename}`;
    }

    const creator = await CommunityCreator.create({
      handle,
      role,
      img,
      displayOrder: Number(displayOrder) || 0,
      status: status || "active",
    });

    res.status(201).json(creator);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create creator", error: err.message });
  }
};

exports.updateCreator = async (req, res) => {
  try {
    const { id } = req.params;
    const creator = await CommunityCreator.findByPk(id);
    if (!creator) return res.status(404).json({ message: "Creator not found" });

    const { handle, role, img: explicitImg, displayOrder, status } = req.body;
    if (handle !== undefined) creator.handle = handle;
    if (role !== undefined) creator.role = role;
    if (displayOrder !== undefined) creator.displayOrder = Number(displayOrder) || 0;
    if (status !== undefined) creator.status = status;

    if (req.file) {
      creator.img = `/uploads/${req.file.filename}`;
    } else if (explicitImg) {
      creator.img = explicitImg;
    }

    await creator.save();
    res.json(creator);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update creator", error: err.message });
  }
};

exports.toggleCreatorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const creator = await CommunityCreator.findByPk(id);
    if (!creator) return res.status(404).json({ message: "Creator not found" });

    creator.status = creator.status === "active" ? "inactive" : "active";
    await creator.save();
    res.json({ message: "Creator status updated", creator });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle creator status", error: err.message });
  }
};

exports.deleteCreator = async (req, res) => {
  try {
    const { id } = req.params;
    const creator = await CommunityCreator.findByPk(id);
    if (!creator) return res.status(404).json({ message: "Creator not found" });

    await creator.destroy();
    res.json({ message: "Creator deleted successfully", id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete creator", error: err.message });
  }
};

// ==========================================
// 4. TOP CONTRIBUTORS MANAGEMENT (ADMIN)
// ==========================================
exports.getAllContributorsAdmin = async (req, res) => {
  try {
    const contributors = await CommunityContributor.findAll({
      order: [["rank", "ASC"]],
    });
    res.json(contributors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch contributors", error: err.message });
  }
};

exports.createContributor = async (req, res) => {
  try {
    const { rank, name, points, role, avatar: explicitAvatar, badgeClass, status } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    let avatar = explicitAvatar || null;
    if (req.file) {
      avatar = `/uploads/${req.file.filename}`;
    }

    const contributor = await CommunityContributor.create({
      rank: Number(rank) || 1,
      name,
      points: points || "0 points",
      role: role || "Community Member",
      avatar,
      badgeClass: badgeClass || "star",
      status: status || "active",
    });

    res.status(201).json(contributor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create contributor", error: err.message });
  }
};

exports.updateContributor = async (req, res) => {
  try {
    const { id } = req.params;
    const contributor = await CommunityContributor.findByPk(id);
    if (!contributor) return res.status(404).json({ message: "Contributor not found" });

    const { rank, name, points, role, avatar: explicitAvatar, badgeClass, status } = req.body;
    if (rank !== undefined) contributor.rank = Number(rank) || 1;
    if (name !== undefined) contributor.name = name;
    if (points !== undefined) contributor.points = points;
    if (role !== undefined) contributor.role = role;
    if (badgeClass !== undefined) contributor.badgeClass = badgeClass;
    if (status !== undefined) contributor.status = status;

    if (req.file) {
      contributor.avatar = `/uploads/${req.file.filename}`;
    } else if (explicitAvatar !== undefined) {
      contributor.avatar = explicitAvatar;
    }

    await contributor.save();
    res.json(contributor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update contributor", error: err.message });
  }
};

exports.toggleContributorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const contributor = await CommunityContributor.findByPk(id);
    if (!contributor) return res.status(404).json({ message: "Contributor not found" });

    contributor.status = contributor.status === "active" ? "inactive" : "active";
    await contributor.save();
    res.json({ message: "Contributor status updated", contributor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle status", error: err.message });
  }
};

exports.deleteContributor = async (req, res) => {
  try {
    const { id } = req.params;
    const contributor = await CommunityContributor.findByPk(id);
    if (!contributor) return res.status(404).json({ message: "Contributor not found" });

    await contributor.destroy();
    res.json({ message: "Contributor deleted successfully", id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete contributor", error: err.message });
  }
};

// ==========================================
// 5. COMMUNITY SETTINGS (HERO, STATS, QUOTES)
// ==========================================
exports.getSettings = async (req, res) => {
  try {
    let settings = await CommunitySetting.findOne();
    if (!settings) {
      settings = await CommunitySetting.create({
        heroTag: "// FLAZO COMMUNITY",
        heroTitle: "Not Just Listeners. A Community That Feels.",
        heroSubtitle:
          "Connect. Share. Learn. Create. Grow. Because better sound brings better people together.",
        heroImage: "/images/flazo_community_hero_hq.jpg",
        membersCount: "25K+",
        discussionsCount: "10K+",
        answersCount: "500+",
        expertsCount: "50+",
        memberQuote:
          "Flazo community feels like a family. It's amazing to see real people talking, helping and vibing over something we all love — music.",
        quoteAuthor: "Neha P., Community Member",
      });
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch settings", error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    let settings = await CommunitySetting.findOne();
    if (!settings) {
      settings = await CommunitySetting.create({});
    }

    const b = req.body;
    if (b.heroTag !== undefined) settings.heroTag = b.heroTag;
    if (b.heroTitle !== undefined) settings.heroTitle = b.heroTitle;
    if (b.heroHeadline !== undefined) settings.heroTitle = b.heroHeadline;
    if (b.heroSubtitle !== undefined) settings.heroSubtitle = b.heroSubtitle;
    if (b.membersCount !== undefined) settings.membersCount = b.membersCount;
    if (b.heroMembersCount !== undefined) settings.membersCount = b.heroMembersCount;
    if (b.discussionsCount !== undefined) settings.discussionsCount = b.discussionsCount;
    if (b.heroDiscussionsCount !== undefined) settings.discussionsCount = b.heroDiscussionsCount;
    if (b.answersCount !== undefined) settings.answersCount = b.answersCount;
    if (b.heroAnswersCount !== undefined) settings.answersCount = b.heroAnswersCount;
    if (b.expertsCount !== undefined) settings.expertsCount = b.expertsCount;
    if (b.heroExpertsCount !== undefined) settings.expertsCount = b.heroExpertsCount;
    if (b.memberQuote !== undefined) settings.memberQuote = b.memberQuote;
    if (b.heroQuote !== undefined) settings.memberQuote = b.heroQuote;
    if (b.quoteAuthor !== undefined) settings.quoteAuthor = b.quoteAuthor;
    if (b.heroQuoteAuthor !== undefined) settings.quoteAuthor = b.heroQuoteAuthor;

    // Expanded Dynamic Settings
    if (b.watchStoryText !== undefined) settings.watchStoryText = b.watchStoryText;
    if (b.watchStoryUrl !== undefined) settings.watchStoryUrl = b.watchStoryUrl;
    if (b.joinButtonText !== undefined) settings.joinButtonText = b.joinButtonText;
    if (b.pillarsText !== undefined) settings.pillarsText = b.pillarsText;
    if (b.ideaCardTitle !== undefined) settings.ideaCardTitle = b.ideaCardTitle;
    if (b.ideaCardSubtitle !== undefined) settings.ideaCardSubtitle = b.ideaCardSubtitle;
    if (b.ideaCardButtonText !== undefined) settings.ideaCardButtonText = b.ideaCardButtonText;
    if (b.missionCardTitle !== undefined) settings.missionCardTitle = b.missionCardTitle;
    if (b.missionCardSubtitle !== undefined) settings.missionCardSubtitle = b.missionCardSubtitle;
    if (b.missionCardBadge !== undefined) settings.missionCardBadge = b.missionCardBadge;

    if (req.file) {
      settings.heroImage = `/uploads/${req.file.filename}`;
    } else if (b.heroImage) {
      settings.heroImage = b.heroImage;
    }

    await settings.save();
    res.json({ message: "Settings updated successfully", settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update settings", error: err.message });
  }
};

// ==========================================
// 6. TOPIC CARDS MANAGEMENT (ADMIN)
// ==========================================
exports.getAllTopicsAdmin = async (req, res) => {
  try {
    const topics = await CommunityTopic.findAll({
      order: [["displayOrder", "ASC"]],
    });
    const formatted = topics.map((t) => {
      const data = t.toJSON();
      data.isActive = data.status === "active";
      return data;
    });
    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch topics", error: err.message });
  }
};

exports.createTopic = async (req, res) => {
  try {
    const { topicId, slug, title, desc, icon, iconName, displayOrder, status, isActive } = req.body;
    const finalTopicId = topicId || slug;
    if (!title || !finalTopicId) {
      return res.status(400).json({ message: "Title and topicId (or slug) are required" });
    }

    let finalStatus = status;
    if (!finalStatus && isActive !== undefined) {
      finalStatus = (isActive === true || isActive === "true") ? "active" : "inactive";
    }

    const topic = await CommunityTopic.create({
      topicId: finalTopicId,
      title,
      desc,
      icon: icon || iconName || "Headphones",
      displayOrder: Number(displayOrder) || 0,
      status: finalStatus || "active",
    });

    const topicData = topic.toJSON();
    topicData.isActive = topicData.status === "active";

    res.status(201).json(topicData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create topic", error: err.message });
  }
};

exports.updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await CommunityTopic.findByPk(id);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    const { topicId, slug, title, desc, icon, iconName, displayOrder, status, isActive } = req.body;
    if (topicId !== undefined || slug !== undefined) topic.topicId = topicId || slug;
    if (title !== undefined) topic.title = title;
    if (desc !== undefined) topic.desc = desc;
    if (icon !== undefined || iconName !== undefined) topic.icon = icon || iconName;
    if (displayOrder !== undefined) topic.displayOrder = Number(displayOrder) || 0;
    if (status !== undefined) {
      topic.status = status;
    } else if (isActive !== undefined) {
      topic.status = (isActive === true || isActive === "true") ? "active" : "inactive";
    }

    await topic.save();
    const topicData = topic.toJSON();
    topicData.isActive = topicData.status === "active";

    res.json(topicData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update topic", error: err.message });
  }
};

exports.toggleTopicStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await CommunityTopic.findByPk(id);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    topic.status = topic.status === "active" ? "inactive" : "active";
    await topic.save();

    const topicData = topic.toJSON();
    topicData.isActive = topicData.status === "active";

    res.json({ message: "Topic status updated", topic: topicData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to toggle topic status", error: err.message });
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await CommunityTopic.findByPk(id);
    if (!topic) return res.status(404).json({ message: "Topic not found" });

    await topic.destroy();
    res.json({ message: "Topic deleted successfully", id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete topic", error: err.message });
  }
};
