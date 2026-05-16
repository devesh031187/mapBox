import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const redirectTo =
    (location.state as LocationState | null)?.from?.pathname ?? '/dashboard';

  const onSubmit = async (values: LoginForm) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      setFormError(
        axiosErr.response?.data?.message ??
          'Unable to sign in. Please check your credentials.',
      );
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-600 text-lg font-bold text-white">
            H
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">
            HFIMS
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Hotel F&amp;B Inventory Management
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-slate-800">
            Sign in to your account
          </h2>

          {formError && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@hotel.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              size="lg"
            >
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Authorised personnel only. Activity is logged.
        </p>
      </div>
    </div>
  );
}
