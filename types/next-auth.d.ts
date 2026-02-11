import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      employeeId?: string;
      jobTitle?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    idToken?: string;
    employeeId?: string;
    jobTitle?: string;
    displayName?: string;
  }
}
