import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inscription",
  description:
    "Première inscription MindStress — profil confidentiel et pseudonyme pour le Banc public.",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
