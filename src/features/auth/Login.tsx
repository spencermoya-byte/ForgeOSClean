import React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../../auth/authContext';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginInput = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });
  const { login } = useAuth();

  const onSubmit = (data: LoginInput) => {
    // Simulate login
    login(data.username, data.password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Login</h2>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium text-white">Username</label>
          <input
            id="username"
            type="text"
            {...register('username')}
            className="mt-1 block w-full p-2 border rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-white">Password</label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="mt-1 block w-full p-2 border rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
