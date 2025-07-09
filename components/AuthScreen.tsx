import React, { useState } from 'react';
import { NoteIcon } from './Icons';
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '../services/firebaseService';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // onAuthStateChanged in App.tsx will handle successful login
    } catch (err: any) {
        let friendlyMessage = 'An unknown error occurred.';
        if (err.code) {
            switch (err.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    friendlyMessage = 'Invalid email or password.';
                    break;
                case 'auth/email-already-in-use':
                    friendlyMessage = 'An account with this email already exists.';
                    break;
                case 'auth/weak-password':
                    friendlyMessage = 'Password must be at least 6 characters.';
                    break;
                case 'auth/invalid-email':
                    friendlyMessage = 'Please enter a valid email address.';
                    break;
                default:
                    friendlyMessage = 'Authentication failed. Please try again.';
            }
        }
        setError(friendlyMessage);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center">
          <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
            <NoteIcon className="w-8 h-8 text-amber-500 dark:text-amber-400" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-center text-gray-800 dark:text-gray-100">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">to Gemini Notes</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 block mb-1">Email</label>
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg mt-1 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition" 
                required 
            />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 block mb-1">Password</label>
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-3 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg mt-1 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition" 
                required 
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-500 rounded-lg text-white font-semibold transition-colors disabled:bg-amber-300 disabled:cursor-not-allowed flex items-center justify-center">
            {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (isLogin ? 'Log In' : 'Sign Up')}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button onClick={() => {setIsLogin(!isLogin); setError('')}} className="text-amber-500 dark:text-amber-400 hover:underline ml-1 font-semibold">
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
