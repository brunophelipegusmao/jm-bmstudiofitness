import { apiClient } from "@/lib/api-client";

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  color?: string;
  createdAt?: string | Date;
}

const mapCategory = (category: unknown): Category => {
  const c = category as Record<string, unknown>;
  return {
    id: (c.id as string) ?? "",
    name: (c.name as string) ?? "",
    slug: c.slug as string | undefined,
    description: (c.description as string) ?? null,
    color: (c.color as string) ?? "#64748b",
    createdAt: c.createdAt as string | Date | undefined,
  };
};

export async function getCategoriesAction(): Promise<Category[]> {
  const data = await apiClient.get<unknown[]>("/blog/categories");
  return (data || []).map(mapCategory);
}

export async function createCategoryAction(input: {
  name: string;
  description?: string;
  color?: string;
}): Promise<Category> {
  const payload = {
    name: input.name,
    description: input.description,
  };
  const category = await apiClient.post<unknown>(
    "/blog/categories",
    payload,
  );
  return mapCategory(Array.isArray(category) ? category[0] : category);
}

export async function updateCategoryAction(
  id: string | number,
  input: { name?: string; description?: string; color?: string },
): Promise<Category> {
  const payload = {
    name: input.name,
    description: input.description,
  };
  const category = await apiClient.patch<unknown>(
    `/blog/categories/${id}`,
    payload,
  );
  return mapCategory(Array.isArray(category) ? category[0] : category);
}

export async function deleteCategoryAction(
  id: string | number,
): Promise<{ success: boolean }> {
  await apiClient.delete(`/blog/categories/${id}`);
  return { success: true };
}
