import React from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Avatar: React.FC<AvatarProps> = ({ src, name, size = 'md' }) => {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((part) => part[0] || '')
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const px = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  const fontSizes = {
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
  };

  const colors = [
    '#6366f1', // indigo-500
    '#10b981', // green-500
    '#3b82f6', // blue-500
    '#8b5cf6', // purple-500
    '#ec4899', // pink-500
    '#f97316', // orange-500
    '#14b8a6', // teal-500
  ];

  const colorIndex = name && name.length ? name.charCodeAt(0) % colors.length : 0;

  const sizePx = px[size] || px.md;
  const fontSize = fontSizes[size] || fontSizes.md;

  const wrapperStyle: React.CSSProperties = {
    width: sizePx,
    height: sizePx,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: src ? 'transparent' : colors[colorIndex],
    color: '#fff',
    fontWeight: 700,
    fontSize,
    flex: '0 0 auto',
  };

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  };

  return (
    <div style={wrapperStyle} aria-label={name} title={name}>
      {src ? (
        // eslint-disable-next-line jsx-a11y/img-redundant-alt
        <img src={src} alt={`${name} avatar`} style={imgStyle} />
      ) : (
        getInitials(name)
      )}
    </div>
  );
};
