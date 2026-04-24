// export default function Home() {
//   const database_url = process.env.DATABASE_URL
//   const which_load = process.env.WHICH_LOAD
//   return (
//     <>
//       <h1>LMS App starts here!</h1>
//       <p>{database_url}</p>      
//       <p>{which_load}</p>
//     </>
//   );
// }

// import prisma from "@/lib/prisma";
// export default async function Home() {
//   const users = await prisma.user.findMany();
//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
//       <h1 className="text-4xl font-bold mb-8 font-[family-name:var(--font-geist-sans)] text-[#333333]">
//         LMS App
//       </h1>
//       <ol className="list-decimal list-inside font-[family-name:var(--font-geist-sans)]">
//         {users.map((user) => (
//           <li key={user.id} className="mb-2">
//             {user.name}
//           </li>
//         ))}
//       </ol>
//     </div>
//   );
// }

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"                                                                                                                                                                                                                               

export default async function Home() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin")
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-neutral-800 rounded-lg p-6 max-w-xl w-full">
        <h1 className="text-white text-xl mb-4 text-center">Auth.js + Prisma</h1>
        <div className="text-center text-white">Bienvenido {session.user?.name}</div>
      </div>
    </div>
  );
}
