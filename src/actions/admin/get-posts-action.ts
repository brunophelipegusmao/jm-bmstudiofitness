"use server";

import { desc, eq, ilike } from "drizzle-orm";

import { db } from "@/db";
import { posts } from "@/db/schema";

export async function getPostsAction() {
  try {
    const allPosts = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt));

    return allPosts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error("Failed to fetch posts");
  }
}

export async function getPostByIdAction(id: number) {
  try {
    const post = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

    return post[0] || null;
  } catch (error) {
    console.error("Error fetching post:", error);
    throw new Error("Failed to fetch post");
  }
}

export async function searchPostsAction(searchTerm: string) {
  try {
    const searchResults = await db
      .select()
      .from(posts)
      .where(ilike(posts.title, `%${searchTerm}%`))
      .orderBy(desc(posts.createdAt));

    return searchResults;
  } catch (error) {
    console.error("Error searching posts:", error);
    throw new Error("Failed to search posts");
  }
}
