"use client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/Toaster";

const schema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
  year: z.coerce.number().min(1).max(4),
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", year: 1 },
  });
  const onSubmit = async (data: FormData) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (res.ok) {
      toast(json.message || 'Registered successfully. Please verify email.', 'success');
      reset();
    } else {
      toast(json.error || "Registration failed", 'error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gradientStart to-gradientEnd">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white/10 p-8 rounded-xl shadow-lg w-full max-w-md flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-white text-center mb-2">Register</h2>
        <div>
          <input {...register("name")} type="text" placeholder="Name" className="w-full px-4 py-2 rounded bg-white/80 focus:outline-primary" />
          {errors.name && <p className="text-red-300 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <input {...register("email")} type="email" placeholder="Email" className="w-full px-4 py-2 rounded bg-white/80 focus:outline-primary" />
          {errors.email && <p className="text-red-300 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <input {...register("password")} type="password" placeholder="Password" className="w-full px-4 py-2 rounded bg-white/80 focus:outline-primary" />
          {errors.password && <p className="text-red-300 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <div>
          <select {...register("year")} className="w-full px-4 py-2 rounded bg-white/80 focus:outline-primary">
            <option value={1}>1st Year</option>
            <option value={2}>2nd Year</option>
            <option value={3}>3rd Year</option>
            <option value={4}>4th Year</option>
          </select>
          {errors.year && <p className="text-red-300 text-sm mt-1">Select a valid year</p>}
        </div>
        <button type="submit" className="bg-primary text-white font-bold py-2 rounded hover:brightness-110 transition" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
