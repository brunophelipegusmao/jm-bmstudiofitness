import { findAllPostsAdmin } from "@/lib/post/quieries/admin";
import clsx from "clsx";
import { DeletePostButton } from "../DeletePostButton";
import Link from "next/link";
import ErrorMessage from "../../ErrorMessage";

export default async function PostsListAdmin() {
  const posts = await findAllPostsAdmin();

  if (posts.length <= 0)
    return (
      <ErrorMessage
        contentTitle="Acoooorda!!! 🤓"
        content="Você ainda não criou nenhum post."
      />
    );

  return (
    <div className="mb-16 ">
      {posts.map((post) => {
        return (
          <div
            className={clsx(
              "px-2 py-2",
              !post.published && "rounded-xl bg-[#C2A537] font-bold text-black",
              "flex items-center justify-between gap-2"
            )}
            key={post.id}
          >
            <Link href={`/admin/post/${post.id}`}>{post.title}</Link>
            {!post.published && (
              <span className="text-xs italic text-black/60">
                (Não publicado)
              </span>
            )}

            <DeletePostButton id={post.id} title={post.title} />
          </div>
        );
      })}
    </div>
  );
}
