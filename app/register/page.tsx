import { RegisterForm } from "@/components/register-form";

export const metadata = { title: "Register — MLA" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <div className="rounded-md border border-parchment/10 bg-panel p-8">
        <h1 className="font-display text-3xl text-parchment">Join MLA</h1>
        <p className="mt-2 text-sm text-parchment/60">
          Register under your institution to learn, mentor, and buy from the
          shop.
        </p>
        <RegisterForm />
      </div>
    </div>
  );
}