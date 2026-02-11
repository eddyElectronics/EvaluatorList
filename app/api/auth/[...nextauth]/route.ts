import NextAuth, { NextAuthOptions } from 'next-auth';
import AzureADProvider from 'next-auth/providers/azure-ad';

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: 'openid profile email User.Read',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the access_token and additional user info
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        
        // Fetch user profile from MS Graph to get employeeId
        if (account.access_token) {
          try {
            const response = await fetch('https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,jobTitle,employeeId', {
              headers: {
                Authorization: `Bearer ${account.access_token}`,
              },
            });
            if (response.ok) {
              const graphProfile = await response.json();
              token.employeeId = graphProfile.employeeId;
              token.jobTitle = graphProfile.jobTitle;
              token.displayName = graphProfile.displayName;
            }
          } catch (error) {
            console.error('Error fetching MS Graph profile:', error);
          }
        }
      }
      if (profile && !token.employeeId) {
        token.employeeId = (profile as any).employeeId;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      session.user.employeeId = token.employeeId as string;
      session.user.jobTitle = token.jobTitle as string;
      if (token.displayName) {
        session.user.name = token.displayName as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
