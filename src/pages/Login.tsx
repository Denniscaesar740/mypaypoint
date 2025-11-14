import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import { ApiError, login as loginRequest } from '../lib/api';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('paypoint.rememberEmail');
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true
      }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password, rememberMe } = formData;

    setIsLoading(true);

    try {
      const response = await loginRequest({ email, password });

      localStorage.setItem('paypoint.session', JSON.stringify(response));

      if (rememberMe) {
        localStorage.setItem('paypoint.rememberEmail', email);
      } else {
        localStorage.removeItem('paypoint.rememberEmail');
      }

      setFormData((prev) => ({
        ...prev,
        password: ''
      }));

      toast.success('Signed in successfully!');
      if (response.user.role === 'super-admin') {
        navigate('/dashboard/super-admin');
      } else if (response.user.role === 'organization-admin') {
        navigate('/dashboard/org-admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message);
      } else {
        toast.error('Unexpected error. Please try again.');
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 text-indigo-600 hover:text-indigo-700 transition-colors mb-6">
            <CreditCard className="h-10 w-10" />
            <span className="text-2xl font-bold">PayPoint</span>
          </Link>
          <h2 className="text-3xl font-bold text-zinc-800">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Or{' '}
            <Link to="/apply" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              apply for a new account
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-800 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-800 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <div className="space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
              <p className="text-xs text-slate-500 text-center">
                Use <span className="font-semibold">admin@paypoint.com</span> / <span className="font-semibold">AdminPass123!</span> for the default Super Admin demo login.
              </p>
            </div>
          </form>
        </div>

        {/* Footer Links */}
        <div className="text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/apply" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
              Apply now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
