export default function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <span className={`logo${claro ? ' logo-claro' : ''}`}>
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <rect width="34" height="34" rx="9" fill="#E8590C" />
        <path d="M7 14.5 17 9l10 5.5-10 5.5-10-5.5Z" fill="#fff" />
        <path d="M11 17.3v4.6c0 1.6 2.7 3.1 6 3.1s6-1.5 6-3.1v-4.6l-6 3.3-6-3.3Z" fill="#fff" opacity=".85" />
      </svg>
      <span className="logo-txt"><b>Posgrado FISI</b><small>Admisión</small></span>
    </span>
  );
}
