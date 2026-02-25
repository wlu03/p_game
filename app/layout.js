import "./globals.css";

export const metadata = {
  title: "Market Making Simulator",
  description: "Test your probability estimation skills in this market-making trading game",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
