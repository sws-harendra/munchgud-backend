const { Blog, User } = require("../models");
const slugify = require("slugify");

const defaultBlogs = [
  {
    title: "The Science Behind Exceptional Sound",
    slug: "the-science-behind-exceptional-sound",
    category: "Technology",
    excerpt: "Discover how dual-coaxial drivers, 50dB Hybrid ANC and Auracast™ work together to create a truly immersive listening experience.",
    content: `<h2>Mastering the Acoustic Landscape</h2><p>Sound is not merely pressure waves vibrating through air—it is an intricate emotional conduit. At Flazo, every acoustic chamber is precision-engineered using 13.4mm titanium-coated dual drivers.</p><h3>1. Hybrid Active Noise Cancellation (50dB)</h3><p>By deploying both feedforward and feedback microphones, the internal processor samples ambient noise at 40,000 times per second, generating an inverted soundwave that neutralizes decibels before they reach your ear canal.</p><h3>2. The Role of High-Resolution Codecs</h3><p>Support for LDAC and aptX Adaptive preserves high-fidelity 24-bit/96kHz audio data streams, ensuring every cymbal tap and cello resonance remains uncompressed.</p>`,
    featuredImage: "/images/blog_featured_exploded.jpg",
    isFeatured: true,
    isTrending: true,
    readTime: "6 min read",
    views: 12400,
    authorName: "Team Flazo",
    tags: JSON.stringify(["Technology", "Sound Engineering", "ANC"]),
    status: "published",
    publishedAt: new Date(),
  },
  {
    title: "10 Tips to Get the Best Sound From Your Flazo Earbuds",
    slug: "10-tips-to-get-the-best-sound-from-your-flazo-earbuds",
    category: "Tips & Tricks",
    excerpt: "A simple guide to get you started in minutes and enjoy the full Flazo experience.",
    content: `<h2>Unlock Peak Acoustic Performance</h2><p>Getting studio-grade audio out of your wireless earbuds requires more than just pairing via Bluetooth. Here are ten expert tips:</p><ol><li><strong>Choose the Right Ear-Tip Size:</strong> A tight acoustic seal is responsible for up to 80% of low-end bass response.</li><li><strong>Calibrate the EQ:</strong> Use the companion profile to tailor frequencies to your specific hearing curve.</li><li><strong>Clean Speaker Meshes:</strong> Prevent wax buildup using a microfiber tip.</li></ol>`,
    featuredImage: "/images/spotlight-earbud.jpg",
    isFeatured: false,
    isTrending: true,
    readTime: "5 min read",
    views: 18200,
    authorName: "Acoustic Labs",
    tags: JSON.stringify(["Tips", "Product Guides", "Maintenance"]),
    status: "published",
    publishedAt: new Date(),
  },
  {
    title: "ANC vs ENC: What's the Difference?",
    slug: "anc-vs-enc-whats-the-difference",
    category: "Technology",
    excerpt: "Understanding how Active Noise Cancellation differs from Environmental Noise Cancellation for your calls.",
    content: `<h2>Demystifying Noise Cancellation</h2><p>Many consumers confuse ANC with ENC. While both reduce unwanted decibels, they serve fundamentally distinct purposes in wireless personal audio.</p><h3>Active Noise Cancellation (ANC)</h3><p>ANC protects YOUR ears. It targets low-frequency hums (jet engines, air conditioners, train tracks) by calculating opposing soundwaves directly inside the ear cup.</p><h3>Environmental Noise Cancellation (ENC)</h3><p>ENC protects the CALLER'S ears on the other end of your phone conversation. It isolates your vocal cords while suppressing passing traffic and cafe chatter.</p>`,
    featuredImage: "/images/blog_card_man_focus.jpg",
    isFeatured: false,
    isTrending: true,
    readTime: "6 min read",
    views: 14100,
    authorName: "Team Flazo",
    tags: JSON.stringify(["Technology", "ANC", "ENC"]),
    status: "published",
    publishedAt: new Date(),
  },
  {
    title: "How to Choose the Right Earbuds for Your Lifestyle",
    slug: "how-to-choose-the-right-earbuds-for-your-lifestyle",
    category: "Lifestyle",
    excerpt: "From daily commutes and intense gym workouts to studio listening—find your perfect acoustic match.",
    content: `<h2>Tailoring Sound to Daily Routines</h2><p>Are you a long-distance runner needing IPX7 sweatproofing, or an audiophile craving LDAC lossless playback? Here is our comprehensive buying guide.</p>`,
    featuredImage: "/images/community_ambassador_creator.jpg",
    isFeatured: false,
    isTrending: true,
    readTime: "4 min read",
    views: 12000,
    authorName: "Lifestyle Desk",
    tags: JSON.stringify(["Lifestyle", "Earbuds", "Buying Guide"]),
    status: "published",
    publishedAt: new Date(),
  },
  {
    title: "How to Set Up Your Flazo Earbuds (Step-by-Step)",
    slug: "how-to-set-up-your-flazo-earbuds-step-by-step",
    category: "Product Guides",
    excerpt: "A simple guide to get you started in minutes and enjoy the full Flazo experience.",
    content: `<h2>Step-by-Step Initial Setup</h2><p>1. Open the lid of the golden charging case. 2. Remove protective film from charging contacts. 3. Turn on Bluetooth on your device and select 'Flazo Nirvana'.</p>`,
    featuredImage: "/images/blog_card_book.jpg",
    isFeatured: false,
    isTrending: false,
    readTime: "4 min read",
    views: 8900,
    authorName: "Customer Support",
    tags: JSON.stringify(["Product Guides", "Quickstart"]),
    status: "published",
    publishedAt: new Date(),
  },
  {
    title: "Music for a More Focused and Productive You",
    slug: "music-for-a-more-focused-and-productive-you",
    category: "Lifestyle",
    excerpt: "Discover how the right sound can boost your focus, mood and productivity.",
    content: `<h2>Binaural Beats and Flow State</h2><p>Neuroscience proves that steady rhythmic patterns between 40Hz and 60Hz induce gamma brainwave synchronization, drastically cutting mental fatigue during deep work sessions.</p>`,
    featuredImage: "/images/blog_card_man_focus.jpg",
    isFeatured: false,
    isTrending: false,
    readTime: "5 min read",
    views: 15300,
    authorName: "Mind & Audio",
    tags: JSON.stringify(["Lifestyle", "Focus", "Productivity"]),
    status: "published",
    publishedAt: new Date(),
  },
];

const seedDefaultsIfEmpty = async () => {
  try {
    const count = await Blog.count();
    if (count === 0) {
      await Blog.bulkCreate(defaultBlogs);
    }
  } catch (err) {
    console.error("Error seeding default blogs:", err);
  }
};

/**
 * Create a new blog
 */
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      category,
      isFeatured,
      isTrending,
      readTime,
      views,
      authorName,
      tags,
      status,
      metaTitle,
      metaDescription,
      metaKeywords,
      featuredImage: explicitImage,
    } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required" });
    }

    let slug = slugify(title, { lower: true, strict: true });
    // Check slug collision
    const existing = await Blog.findOne({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    let featuredImage = explicitImage || null;
    if (req.file) {
      featuredImage = `/uploads/${req.file.filename}`;
    }

    // Auto-calculate read time if missing
    let computedReadTime = readTime;
    if (!computedReadTime && content) {
      const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
      const minutes = Math.max(1, Math.round(words / 200));
      computedReadTime = `${minutes} min read`;
    }

    let tagsStr = tags;
    if (Array.isArray(tags)) {
      tagsStr = JSON.stringify(tags);
    } else if (typeof tags === "string" && !tags.startsWith("[")) {
      tagsStr = JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean));
    }

    const blog = await Blog.create({
      title,
      slug,
      content,
      excerpt,
      category: category || "Product Guides",
      isFeatured: isFeatured === "true" || isFeatured === true,
      isTrending: isTrending === "true" || isTrending === true,
      readTime: computedReadTime || "5 min read",
      views: Number(views) || 0,
      authorName: authorName || "Team Flazo",
      tags: tagsStr || "[]",
      featuredImage,
      status: status || "published",
      metaTitle,
      metaDescription,
      metaKeywords,
      authorId: req.user?.id || null,
      publishedAt: status === "published" ? new Date() : null,
    });

    res.status(201).json(blog);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to create blog", error: err.message });
  }
};

/**
 * Get all blogs
 */
exports.getAllBlogs = async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      include: [
        { model: User, as: "author", attributes: ["id", "fullname", "email"] },
      ],
      order: [
        ["isFeatured", "DESC"],
        ["isTrending", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json(blogs);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch blogs", error: err.message });
  }
};

/**
 * Get single blog by id or slug
 */
exports.getBlogById = async (req, res) => {
  try {
    const { slug } = req.params;

    let blog = null;
    if (!isNaN(Number(slug))) {
      blog = await Blog.findByPk(slug, {
        include: [
          { model: User, as: "author", attributes: ["id", "fullname", "email"] },
        ],
      });
    }

    if (!blog) {
      blog = await Blog.findOne({
        where: { slug },
        include: [
          { model: User, as: "author", attributes: ["id", "fullname", "email"] },
        ],
      });
    }

    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Increment views
    try {
      await blog.increment("views", { by: 1 });
    } catch {}

    res.json(blog);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch blog", error: err.message });
  }
};

/**
 * Update blog
 */
exports.updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const {
      title,
      content,
      excerpt,
      category,
      isFeatured,
      isTrending,
      readTime,
      views,
      authorName,
      tags,
      status,
      metaTitle,
      metaDescription,
      metaKeywords,
      featuredImage: explicitImage,
    } = req.body;

    if (title !== undefined) {
      blog.title = title;
      blog.slug = slugify(title, { lower: true, strict: true });
    }
    if (content !== undefined) blog.content = content;
    if (excerpt !== undefined) blog.excerpt = excerpt;
    if (category !== undefined) blog.category = category;
    if (isFeatured !== undefined) blog.isFeatured = isFeatured === "true" || isFeatured === true;
    if (isTrending !== undefined) blog.isTrending = isTrending === "true" || isTrending === true;
    if (readTime !== undefined) blog.readTime = readTime;
    if (views !== undefined) blog.views = Number(views) || 0;
    if (authorName !== undefined) blog.authorName = authorName;
    if (tags !== undefined) {
      if (Array.isArray(tags)) blog.tags = JSON.stringify(tags);
      else if (typeof tags === "string" && !tags.startsWith("[")) {
        blog.tags = JSON.stringify(tags.split(",").map((t) => t.trim()).filter(Boolean));
      } else {
        blog.tags = tags;
      }
    }
    if (status !== undefined) {
      blog.status = status;
      if (status === "published" && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }
    if (metaTitle !== undefined) blog.metaTitle = metaTitle;
    if (metaDescription !== undefined) blog.metaDescription = metaDescription;
    if (metaKeywords !== undefined) blog.metaKeywords = metaKeywords;

    if (req.file) {
      blog.featuredImage = `/uploads/${req.file.filename}`;
    } else if (explicitImage) {
      blog.featuredImage = explicitImage;
    }

    await blog.save();

    res.json(blog);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to update blog", error: err.message });
  }
};

/**
 * Toggle Status (draft <-> published)
 */
exports.toggleBlogStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.status = blog.status === "published" ? "draft" : "published";
    if (blog.status === "published" && !blog.publishedAt) {
      blog.publishedAt = new Date();
    }
    await blog.save();

    res.json({ message: `Blog status updated to ${blog.status}`, blog });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle status", error: err.message });
  }
};

/**
 * Toggle Featured Status
 */
exports.toggleBlogFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.isFeatured = !blog.isFeatured;
    await blog.save();

    res.json({ message: `Blog featured updated to ${blog.isFeatured}`, blog });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle featured", error: err.message });
  }
};

/**
 * Toggle Trending Status
 */
exports.toggleBlogTrending = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.isTrending = !blog.isTrending;
    await blog.save();

    res.json({ message: `Blog trending updated to ${blog.isTrending}`, blog });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle trending", error: err.message });
  }
};

/**
 * Delete blog
 */
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    await blog.destroy();
    res.json({ message: "Blog deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete blog", error: err.message });
  }
};
