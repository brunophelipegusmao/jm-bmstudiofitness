"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-server";

export async function getCategoriesAction() {
  try {
    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(categories.name);

    return allCategories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new Error("Failed to fetch categories");
  }
}

export async function createCategoryAction(data: {
  name: string;
  description?: string;
  color: string;
}) {
  try {
    // Verificar se o usuário é admin
    await requireAdmin();

    // Gerar slug a partir do nome
    const slug = data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    const newCategory = await db
      .insert(categories)
      .values({
        name: data.name,
        slug: slug,
        description: data.description || null,
        color: data.color,
        createdAt: new Date(),
      })
      .returning();

    return newCategory[0];
  } catch (error) {
    console.error("Error creating category:", error);
    throw new Error("Failed to create category");
  }
}

export async function updateCategoryAction(
  id: number,
  data: {
    name?: string;
    description?: string;
    color?: string;
  },
) {
  try {
    // Verificar se o usuário é admin
    await requireAdmin();

    const updateData: Record<string, string | undefined> = { ...data };

    // Se o nome foi alterado, regenerar o slug
    if (data.name) {
      updateData.slug = data.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
    }

    const updatedCategory = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();

    return updatedCategory[0];
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Failed to update category");
  }
}

export async function deleteCategoryAction(id: number) {
  try {
    // Verificar se o usuário é admin
    await requireAdmin();

    await db.delete(categories).where(eq(categories.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category");
  }
}
