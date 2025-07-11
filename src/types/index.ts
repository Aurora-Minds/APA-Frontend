export interface User {
  _id: string;
  name: string;
  email: string;
  theme?: 'light' | 'dark' | 'system';
  xp?: number;
  // Add any other user properties here
}

export interface UserResponse {
  token: string;
  user: User;
} 