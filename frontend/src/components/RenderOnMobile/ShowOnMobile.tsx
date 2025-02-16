import { ReactNode } from "react";
import styles from './RenderOnMobile.module.css';

/**
 * Component used to render a compnent only if the 
 * @param param0 
 * @returns 
 */
export default function ShowOnMobile({ children, style }: { style?: React.CSSProperties, children?: ReactNode }) {
  return <div style={style}  className={styles.renderOnMobile}>
    {children}
  </div>;
}