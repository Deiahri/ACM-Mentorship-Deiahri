import React, { ReactNode } from "react";
import styles from './ButtonShadow.module.css';

export default function ButtonShadow({ children, active, style, className, onClick }: { children?: ReactNode, style?: React.CSSProperties, className?: string, onClick?: () => any, active?: boolean }) {
  return <div className={`${styles.sqrBtn} ${active ? styles.active : ''} ${className ? className : ''}`} style={style} onClick={onClick}>{children}</div>
}