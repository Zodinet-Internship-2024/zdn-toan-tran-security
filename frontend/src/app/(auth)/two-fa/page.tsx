'use client';
import authApi from '@/app/api/auth';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const TwoFAPage = () => {
  const [twoFACode, setTwoFACode] = useState('');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const username = searchParams.get('username');

  if (!username) {
    router.push('/sign-in');
    return null;
  }

  const handleSend = async () => {
    try {
      const res = await authApi.signIn2fa(username, twoFACode);

      if (res?.message) {
        setMessage(res.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full px-10 gap-4">
      <input
        id="username"
        value={twoFACode}
        onChange={(e) => setTwoFACode(e.target.value)}
        required
        className="block rounded-md border-0 py-1.5 px-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 w-1/2"
      />
      <button
        onClick={handleSend}
        type="submit"
        className="flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-28"
      >
        Send
      </button>
      <p className="text-lg font-semibold mt-2">{message}</p>
    </div>
  );
};
export default TwoFAPage;
