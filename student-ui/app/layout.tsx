import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student Management System",
  description: "Next.js, Spring Boot & PostgreSQL",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-slate-900 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}