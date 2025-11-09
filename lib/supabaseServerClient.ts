import "server-only";

import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase environment variables are missing");
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerComponentClient(
    {
      cookies: () => cookieStore as unknown as ReturnType<typeof cookies>,
    },
    {
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
    }
  );
}

