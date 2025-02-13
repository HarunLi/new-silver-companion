import { request } from './request';

interface LoginResponse {
  access_token: string;
  token_type: string;
}

export const authService = {
  login: async (data: { username: string; password: string }): Promise<LoginResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', data.username);
    formData.append('password', data.password);
    formData.append('grant_type', 'password');

    try {
      console.log('Sending login request with data:', {
        username: data.username,
        grant_type: 'password'
      });

      const response = await request.post('/login/access-token', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log('Login response:', response);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/user/login';
  },
};
