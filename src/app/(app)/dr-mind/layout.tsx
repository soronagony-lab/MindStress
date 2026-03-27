import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dr. Mind",
  description:
    "Échange confidentiel avec Dr. Mind — pistes pour mieux respirer, sans diagnostic médical.",
};

export default function DrMindLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
