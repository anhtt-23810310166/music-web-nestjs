import type { Metadata } from 'next';
import './globals.css';


export const metadata: Metadata = {
  title: 'MusicBox — Nghe nhạc trực tuyến',
  description:
    'Khám phá và thưởng thức hàng triệu bài hát, playlist và nghệ sĩ yêu thích của bạn.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
