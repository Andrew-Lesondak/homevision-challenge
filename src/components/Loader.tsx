type LoaderProps = {
  label?: string;
  compact?: boolean;
};

export const Loader = ({ label = 'Loading', compact = false }: LoaderProps) => {
  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5';
  const textSize = compact ? 'text-xs' : 'text-sm';

  return (
    <div className={`inline-flex items-center gap-2 leading-none text-slate-600 ${textSize}`}>
      <svg
        aria-hidden="true"
        fill="none"
        className={`${iconSize} shrink-0 animate-spin text-sky-600`}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
          stroke="currentColor"
        />
      </svg>
      <span role="status" aria-live="polite" className="whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};
