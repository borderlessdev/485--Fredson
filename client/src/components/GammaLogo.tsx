type GammaLogoProps = {
  className?: string;
  /** sm sidebar · md · lg login · hero destaque máximo */
  size?: 'sm' | 'md' | 'lg' | 'hero';
  /** Só o símbolo (recorte aproximado da marca) */
  markOnly?: boolean;
};

/**
 * Logo oficial Gamma — SEMPRE o arquivo PNG da marca.
 * Sem SVG inventado. Escala grande o suficiente pra ler.
 */
const SIZE = {
  sm: 'h-14 w-auto max-w-[220px]',
  md: 'h-[4.25rem] w-auto max-w-[260px]',
  lg: 'h-24 w-auto max-w-[380px]',
  hero: 'h-28 w-auto max-w-[460px] sm:h-32 sm:max-w-[520px]',
} as const;

const MARK = {
  sm: 'h-12 w-10',
  md: 'h-16 w-12',
  lg: 'h-20 w-16',
  hero: 'h-28 w-20',
} as const;

export function GammaMark({ className = '', size = 'md' }: { className?: string; size?: keyof typeof MARK }) {
  // Usa a logo oficial cortando para o símbolo à esquerda (object-left)
  return (
    <img
      src="/logo-gamma.png"
      alt=""
      aria-hidden
      className={`object-contain object-left ${MARK[size]} ${className}`}
      style={{ objectPosition: '0% 50%', maxWidth: '3.5rem' }}
      decoding="async"
    />
  );
}

export default function GammaLogo({ className = '', size = 'md', markOnly = false }: GammaLogoProps) {
  if (markOnly) {
    return <GammaMark size={size} className={className} />;
  }

  return (
    <img
      src={`/logo-gamma.png?v=brand`}
      alt="Gamma Precatórios"
      className={`block object-contain object-left ${SIZE[size]} ${className}`}
      decoding="async"
      fetchPriority="high"
    />
  );
}
