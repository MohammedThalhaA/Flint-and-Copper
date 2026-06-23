"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.set('admin_session', '', { expires: new Date(0) });
  redirect('/admin/login');
}
