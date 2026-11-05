// app/src/components/PersonAvatar.tsx
// Circular avatar showing first initial of name.
// Can be button (onClick) or span. Tint = background color.
interface PersonAvatarProps {
  name: string;
  tint?: string;
  size?: number;
  onClick?: () => void;
}

export function PersonAvatar({ name, tint, size = 40, onClick }: PersonAvatarProps) {
  const Tag = onClick ? 'button' : 'span';
  const initial = (name || '?')[0];

  return (
    <Tag
      onClick={onClick}
      className="person-avatar"
      aria-label={onClick ? `Message ${name}` : name}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: tint || 'var(--soft)',
      }}
    >
      {initial}
    </Tag>
  );
}
