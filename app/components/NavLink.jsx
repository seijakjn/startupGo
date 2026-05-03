"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NavLink = ({ href, children, style, activeStyle, ...props }) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link 
      href={href} 
      style={{
        ...style,
        ...(isActive ? activeStyle : {})
      }}
      {...props}
    >
      {children}
    </Link>
  );
};
