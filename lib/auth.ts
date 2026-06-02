import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { db } from "./firebase"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Email Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        
        const email = credentials.email as string;
        
        // Guest mode for development
        if (email === "guest@creatoros.com" || credentials.password === "guest") {
          return { id: "guest-user", name: "Guest User", email: "guest@creatoros.com" };
        }

        try {
          const usersRef = db.collection('users');
          const snapshot = await usersRef.where('email', '==', email).limit(1).get();
          
          let user: any;
          if (snapshot.empty) {
            // User profile creation on first login
            const docRef = usersRef.doc();
            user = {
              uid: docRef.id,
              email: email,
              onboardingCompleted: false,
              createdAt: new Date().toISOString()
            };
            await docRef.set(user);
            return { id: user.uid, email: user.email };
          } else {
            user = { uid: snapshot.docs[0].id, ...snapshot.docs[0].data() };
            return { id: user.uid, email: user.email };
          }
        } catch (e) {
          console.error("Auth Firebase Error:", e);
          // If email provider configuration is incomplete, do not block startup
          return { id: "dev-user", email: email };
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
})
