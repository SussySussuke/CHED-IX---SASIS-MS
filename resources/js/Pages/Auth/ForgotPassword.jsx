import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import TextInput from '../../Components/Forms/TextInput';
import InfoBox from '../../Components/Widgets/InfoBox';

const ForgotPassword = ({ status }) => {
  const { data, setData, post, processing, errors } = useForm({
    email: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post('/forgot-password');
  };

  return (
    <>
      <Head title="Forgot Password" />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <img
              src="/images/ched_logo.png"
              alt="CHED Logo"
              className="mx-auto h-20 w-20 object-contain"
            />
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Enter your email to receive password reset instructions
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 space-y-4">
              {status && (
                <InfoBox type="success" message={status} />
              )}

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

              <button
                type="submit"
                disabled={processing}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? 'Sending...' : 'Send Reset Link'}
              </button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
