import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JSON Swiss Knife',
  description: 'All-in-one offline JSON toolkit',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
