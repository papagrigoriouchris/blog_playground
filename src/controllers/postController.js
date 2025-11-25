const { Prisma } = require("@prisma/client");
const prisma = require("../lib/prisma");
const { logActivity } = require("../utils/logger");

async function createPost(req, res) {
  const { title, content, authorId } = req.body || {};

  if (!title || !content || !authorId) {
    return res.status(400).json({ error: "title, content and authorId are required" });
  }

  const authorIdNumber = Number(authorId);
  if (Number.isNaN(authorIdNumber)) {
    return res.status(400).json({ error: "authorId must be a number" });
  }

  const authorExists = await prisma.user.findUnique({
    where: { id: authorIdNumber },
    select: { id: true },
  });

  if (!authorExists) {
    return res.status(404).json({ error: "Author not found" });
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: authorIdNumber,
    },
    include: {
      author: {
        select: { id: true, username: true, email: true, createdAt: true },
      },
    },
  });

  await logActivity(`Post created (id=${post.id}, authorId=${post.authorId})`);

  res.status(201).json(post);
}

async function listPosts(_req, res) {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: { id: true, username: true, email: true, createdAt: true },
      },
    },
  });

  const result = posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: {
      id: post.author.id,
      username: post.author.username,
      email: post.author.email,
    },
  }));

  res.json(result);
}

async function getPostById(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Post id must be a number" });
  }

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: { id: true, username: true, email: true, createdAt: true },
      },
    },
  });

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  res.json({
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: post.author,
  });
}

async function updatePost(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Post id must be a number" });
  }

  const { title, content } = req.body || {};

  if (!title && !content) {
    return res.status(400).json({ error: "Provide title or content to update" });
  }

  try {
    const post = await prisma.post.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(content ? { content } : {}),
      },
      include: {
        author: {
          select: { id: true, username: true, email: true },
        },
      },
    });

    res.json(post);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    throw error;
  }
}

async function deletePost(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Post id must be a number" });
  }

  try {
    const deleted = await prisma.post.delete({
      where: { id },
    });

    await logActivity(`Post deleted (id=${deleted.id}, authorId=${deleted.authorId})`);

    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ error: "Post not found" });
    }
    throw error;
  }
}

module.exports = {
  createPost,
  listPosts,
  getPostById,
  updatePost,
  deletePost,
};
