import { PostForm } from "@/components/admin/post-form";

export const metadata = { title: "New post — MLA Admin" };

export default function NewPostPage() {
  return (
    <div>
      <h2 className="font-display text-2xl text-parchment">New post</h2>
      <PostForm post={null} />
    </div>
  );
}