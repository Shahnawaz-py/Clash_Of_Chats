import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { SocketProvider } from "../context/SocketContext";
import { AudioProvider } from "../context/AudioContext";

export const metadata: Metadata = {
  title: "CLASH OF CHATS — Where Conversations Collide",
  description: "Fantasy clan-inspired real-time chat application built with Next.js, Node.js, Express, MongoDB, and Socket.IO.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anybody:wght@800;900&family=Be+Vietnam+Pro:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Sora:wght@700;800&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="bg-background text-on-background selection:bg-secondary-container selection:text-secondary min-h-screen">
        <AuthProvider>
          <SocketProvider>
            <AudioProvider>
              {children}
            </AudioProvider>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
