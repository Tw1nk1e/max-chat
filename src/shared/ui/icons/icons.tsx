type IconProps = {
  size?: number
}

function Icon({ size = 20, path }: IconProps & { path: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={path} />
    </svg>
  )
}

function PlusIcon(props: IconProps) {
  return <Icon {...props} path="M12 5v14M5 12h14" />
}

function ArrowUpIcon(props: IconProps) {
  return <Icon {...props} path="M12 19V5M5 12l7-7 7 7" />
}

function CloseIcon(props: IconProps) {
  return <Icon {...props} path="M18 6 6 18M6 6l12 12" />
}

export { ArrowUpIcon, CloseIcon, PlusIcon }
