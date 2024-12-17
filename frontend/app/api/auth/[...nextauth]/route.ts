import NextAuth, { Session } from "next-auth";
import { JWT } from 'next-auth/jwt';
import { Account, User as AuthUser } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import User from "@/models/User";
import connect from "@/utils/db";
import { BACKEND_URL } from "@/utils/constants";
import axios from "axios";

const authOptions: any = {
  // Configure one or more authentication providers
  secret: process.env.NEXTAUTH_SECRET as string,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (credentials.email === "") {
          try {
            const userInfo = await axios.get('https://oauth2.googleapis.com/tokeninfo', {  
              params: { id_token: credentials.password }  
            });
            if (userInfo.status === 200)
              return userInfo.data;
            return null;
          } catch (err: any) {
            console.log(err)
          }
        }
        else {
          try {
            const res = await axios.post(`${BACKEND_URL}user/login`, {
              email: credentials.email,
              password: credentials.password,
            })
            
            if (res.status === 200)
              return res.data.user;
          } catch (err: any) {
            console.log(err)
          }
        }
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
    // ...add more providers here
  ],
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24,
    updateAge: 24 * 60 * 60,
  },
  jwt: {
      secret: process.env.NEXTAUTH_SECRET,
      maxAge: 60 * 60 * 24
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token.user && typeof token.user === 'object')
        session.user = token.user;
      return session;
    },
    async jwt({ token, user }: { token: JWT; user: AuthUser }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
    async signIn({ user, account }: { user: AuthUser; account: Account }) {
      if (account?.provider == "credentials") {
        return true;
      }
      if (account?.provider == "github") {
        await connect();
        try {
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            const newUser = new User({
              email: user.email,
            });

            await newUser.save();
            return true;
          }
          return true;
        } catch (err) {
          console.log("Error saving user", err);
          return false;
        }
      }

      if(account?.provider == "google"){
        await connect();
        try {
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            const newUser = new User({
              email: user.email,
            });

            await newUser.save();
            return true;
          }
          return true;
        } catch (err) {
          console.log("Error saving user", err);
          return false;
        }
      }

    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };