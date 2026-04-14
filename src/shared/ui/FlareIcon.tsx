interface FlareIconProps {
  className?: string;
}

export function FlareIcon({ className }: FlareIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="flare-icon-grad" cx="50" cy="50" r="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#FFFAE6" />
          <stop offset="15%"  stopColor="#FFD566" />
          <stop offset="40%"  stopColor="#FF9500" />
          <stop offset="70%"  stopColor="#FF6500" />
          <stop offset="100%" stopColor="#FF3A00" />
        </radialGradient>
      </defs>
      <path
        d="M 50 4
           L 55 39
           L 66 34
           L 61 45
           L 94 50
           L 61 55
           L 66 66
           L 55 61
           L 50 92
           L 45 61
           L 34 66
           L 39 55
           L 6 50
           L 39 45
           L 34 34
           L 45 39
           Z"
        fill="url(#flare-icon-grad)"
      />
    </svg>
  );
}
