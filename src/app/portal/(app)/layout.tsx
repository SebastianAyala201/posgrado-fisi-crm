import PortalShell from '@/components/PortalShell';

export const metadata = { title: 'Portal de admisión · Posgrado FISI' };

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell>{children}</PortalShell>;
}
