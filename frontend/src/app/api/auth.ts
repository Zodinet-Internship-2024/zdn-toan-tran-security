class AuthApi {
  async login(username: string, password: string, recaptchaToken: string) {
    const response = await fetch('http://localhost:5000/auth/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, recaptchaToken }),
    });
    return await response.json();
  }

  signIn2fa = async (username: string, twoFactorAuthenticationCode: string) => {
    const response = await fetch('http://localhost:5000/auth/2fa/sign-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, twoFactorAuthenticationCode }),
    });
    return await response.json();
  };
}

const authApi = new AuthApi();
export default authApi;
