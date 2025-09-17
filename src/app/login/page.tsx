"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toaster";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const json = await res.json();
    if (res.ok) {
      toast('Logged in successfully', 'success');
      router.push("/");
    } else {
      toast(json.error || "Login failed", 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gradientStart to-gradientEnd">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white/10 p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-white text-center mb-2">Login</h2>
        <div>
          <input {...register("email")} type="email" placeholder="Email" className="w-full px-4 py-2 rounded bg-white/80 focus:outline-primary" />
          {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <input {...register("password")} type="password" placeholder="Password" className="w-full px-4 py-2 rounded bg-white/80 focus:outline-primary" />
          {errors.password && <p className="text-red-300 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <button type="submit" className="bg-primary text-white font-bold py-2 rounded hover:brightness-110 transition" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
