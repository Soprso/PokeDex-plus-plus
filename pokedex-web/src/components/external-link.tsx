
// Simplified ExternalLink for web
export function ExternalLink({ href, ...rest }: { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      target="_blank"
      rel="noopener noreferrer"
      href={href}
      {...rest}
    />
  );
}
