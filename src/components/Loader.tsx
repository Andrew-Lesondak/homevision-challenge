type LoaderProps = {
  label?: string;
};

export const Loader = ({ label = 'Loading' }: LoaderProps) => {
  return (
    <div className="inline-flex items-center gap-3 text-sm text-slate-600">
      <svg
        aria-hidden="true"
        fill="none"
        className="h-5 w-5 animate-spin text-sky-600"
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
      <span role="status" aria-live="polite">
        {label}
      </span>
    </div>
  );
};
