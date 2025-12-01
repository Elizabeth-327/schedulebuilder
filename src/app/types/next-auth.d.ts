/* 
 * Author(s): 
 * Date: 11/02/25
 * Description: 
 * Sources: 
 */

import NextAuth from "next-auth";
// Extend the User and Session interfaces to include user ID (because by default, NextAuth does not include it)
declare module "next-auth" {
  interface User {
    id: string;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}