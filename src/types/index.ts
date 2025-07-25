export interface User {
  _id: string;
  name: string;
  email: string;
  theme?: 'light' | 'dark' | 'system';
  xp?: number;
  level?: number;
  experience?: number;
  // GitHub OAuth fields
  githubId?: string;
  githubUsername?: string;
  githubAvatar?: string;
  provider?: 'local' | 'github';
  // Add any other user properties here
}

export interface UserResponse {
  token: string;
  user: User;
} 