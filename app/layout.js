import './globals.css';

export const metadata = {
  title: 'QuickBooks Online Demo',
  description: 'A demo application integrating with QuickBooks Online',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white-50">
        <div className="min-h-screen">
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}