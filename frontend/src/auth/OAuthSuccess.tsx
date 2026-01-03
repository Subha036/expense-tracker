import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const OAuthSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // Save token and redirect
      localStorage.setItem('token', token);
      toast.success('Successfully logged in with Google!');
      // Redirect to dashboard - the AuthContext will pick up the token
      navigate('/dashboard');
    } else {
      toast.error('OAuth login failed - no token received');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Completing login...</h2>
          <p className="mt-2 text-gray-600">Please wait while we set up your account.</p>
        </div>
      </div>
    </div>
  );
};

export default OAuthSuccess;