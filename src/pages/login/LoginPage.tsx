import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Lock, Clock } from 'lucide-react';
import { FlareIcon } from '@/shared/ui/FlareIcon';
import { useAuthStore } from '@/shared/stores/authStore';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must be at most 50 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, lockDetails, clearLoginError, isAuthenticated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/projects', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      navigate('/projects', { replace: true });
    } catch (err) {
      // Error is handled in the store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border border-border rounded-lg shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <FlareIcon className="h-6 w-6" />
            Flare
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your username"
                        className="font-mono"
                        {...field}
                        disabled={isLoading}
                        onChange={(e) => { field.onChange(e); clearLoginError(); }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword((v) => !v)}
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {lockDetails?.isPermanent && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive flex gap-2">
                  <Lock className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Your account has been locked due to too many failed attempts. Please contact your administrator.</span>
                </div>
              )}
              {lockDetails && !lockDetails.isPermanent && (
                <div className="rounded-md bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex gap-2 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400">
                  <Clock className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Your account is temporarily locked. Try again in {lockDetails.remainingMinutes} minute{lockDetails.remainingMinutes !== 1 ? 's' : ''}.</span>
                </div>
              )}
              {error && !lockDetails && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading || lockDetails?.isPermanent === true}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
