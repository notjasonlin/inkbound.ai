// "use client";

// import Link from "next/link";
// import { useEmails } from "../emails/hooks/useEmails";
// import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode } from "react";

// const EmailWidget = () => {
//   const { emails, loading, error } = useEmails(3);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>Error: {error}</div>;

//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//       {emails.map((email: { id: Key | null | undefined; subject: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; date: string | number | Date; from: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; snippet: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined; }) => (
//         <div
//           key={email.id}
//           className="flex flex-col border border-gray-300 rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow duration-200"
//         >
//           <Link href={`/dashboard/emails/threads?threadId=${email.id}`} className="block">
//             <div className="flex justify-between items-start">
//               <h2 className="font-semibold text-lg text-gray-900">{email.subject}</h2>
//               <span className="text-xs text-gray-500">
//                 {new Date(email.date).toLocaleDateString()}
//               </span>
//             </div>
//             <p className="text-sm text-gray-600 mt-2">From: {email.from}</p>
//             <p className="mt-4 text-sm text-gray-700 line-clamp-3">{email.snippet}</p>
//           </Link>
//           <div className="mt-4">
//             <Link href={`/dashboard/emails/threads?threadId=${email.id}`} className="text-blue-600 text-sm font-medium hover:underline">
//               View Full Email
//             </Link>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default EmailWidget;
