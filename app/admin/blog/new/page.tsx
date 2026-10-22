import { PostForm } from "@/components/admin/post-form";

export const metadata = { title: "New post — MLA Admin" };

export default function NewPostPage() {
  return (
    <div>
      <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mb-6">Create New Article</h2>
      <PostForm post={null} />
    </div>
  );
}