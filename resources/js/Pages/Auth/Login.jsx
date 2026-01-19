import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import TextInput from '../../Components/Forms/TextInput';
import ContactAdminModal from '../../Components/Common/ContactAdminModal';

const Login = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const { data, setData, post, processing, errors } = useForm({
    email: '',
    password: '',
    remember: false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/login');
  };

  return (
    <>
      <Head title="Login - CHED HEI System" />
      <div
        className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
        style={{
          backgroundImage: 'url(/images/login_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay filter */}
        <div className="absolute inset-0 bg-blue-900/50 dark:bg-black/40 backdrop-blur-sm"></div>
        <div className="max-w-md w-full relative z-10">
          {/* Logo and Header */}
          <div className="text-center animate-fade-in">
            <div className="inline-block p-4 bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-2xl mb-6 backdrop-blur-md border border-white/20 dark:border-gray-700/50">
              <img
                src="/images/ched_logo.png"
                alt="CHED Logo"
                className="h-16 w-16 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold text-white dark:text-white mb-2 drop-shadow-lg">
              Welcome Back
            </h1>
            <p className="text-sm text-white/90 dark:text-gray-200 drop-shadow-md">
              CHED SASIS Management System- IX
            </p>
          </div>

          {/* Login Form */}
          <form className="mt-10 animate-slide-in" onSubmit={handleSubmit}>
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/50 p-8 space-y-6">
              <TextInput
                label="Email Address"
                name="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
                error={errors.email}
                required
                placeholder="your.email@example.com"
              />

              <TextInput
                label="Password"
                name="password"
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
                error={errors.password}
                required
                placeholder="••••••••"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    checked={data.remember}
                    onChange={(e) => setData('remember', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 dark:border-gray-600 rounded transition-colors"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300 select-none cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200"
              >
                {processing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In to Your Account'
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-white/90 dark:text-gray-200 drop-shadow-md">
            Need an account?{' '}
            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="font-medium text-white hover:text-blue-200 dark:text-blue-300 dark:hover:text-blue-200 transition-colors underline"
            >
              Contact your administrator
            </button>
          </p>

          <div className="mt-8 text-center text-xs text-white/80 dark:text-gray-300 drop-shadow-md">
            <p>Commission on Higher Education</p>
            <p className="mt-1">Republic of the Philippines</p>
          </div>
        </div>

        {/* Contact Admin Modal */}
        <ContactAdminModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      </div>
    </>
  );
};

export default Login;
