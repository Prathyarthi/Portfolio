"use client";

// Email/password login disabled — OAuth only.
// import { useMutation } from "@tanstack/react-query";
// import { signIn } from "next-auth/react";

// export function useLogin() {
//   return useMutation({
//     mutationFn: async ({
//       email,
//       password,
//     }: {
//       email: string;
//       password: string;
//     }) => {
//       const result = await signIn("credentials", {
//         redirect: false,
//         email,
//         password,
//       });
//       if (result?.error) throw new Error("Invalid email or password");
//       return result;
//     },
//   });
// }
