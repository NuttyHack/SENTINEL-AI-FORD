import { Link } from 'wouter';

type BrandLogoProps = {
  light?: boolean;
  variant?: 'mark' | 'wordmark';
  showName?: boolean;
  className?: string;
};

export function BrandLogo({
  light = true,
  variant = 'mark',
  showName = true,
  className = '',
}: BrandLogoProps) {
  const image = variant === 'wordmark'
    ? <img src="/sentinel-logo.jpg" alt="Sentinel AI" className="h-full w-full object-contain" />
    : <img src="/sentinel-mark.jpg" alt="" className="h-full w-full rounded-[11px] object-cover" />;

  return (
    <Link href="/" className={`flex items-center gap-3 ${className}`} data-testid="link-brand-logo">
      <span className={variant === 'wordmark' ? 'block h-[72px] w-[100px] shrink-0 overflow-hidden rounded-xl' : 'block h-9 w-9 shrink-0'}>
        {image}
      </span>
      {showName && variant === 'mark' && (
        <span className={`font-display text-lg font-bold tracking-[-.04em] ${light ? 'text-[#edf0e7]' : 'text-[#102631]'}`}>
          SENTINEL<span className={light ? 'text-[#d8b65d]' : 'text-[#157e83]'}>/AI</span>
        </span>
      )}
    </Link>
  );
}