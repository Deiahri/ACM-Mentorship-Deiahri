import React from "react";
import styles from './RenderOnMobile.module.css'

/**
 * Component used to render a compnent only if the 
 * @param param0 
 * @returns 
 */
const HideOnMobile: React.FC<React.HTMLProps<HTMLDivElement>> = ({children, className, ...rest }) => {
  return <div className={`${styles.hideOnMobile} ${className}`} {...rest}>
    {children}
  </div>;
}
export default HideOnMobile;