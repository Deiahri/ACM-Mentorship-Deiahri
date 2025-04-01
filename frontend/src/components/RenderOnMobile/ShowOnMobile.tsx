import React from 'react';
import styles from './RenderOnMobile.module.css';

/**
 * Component used to render a compnent only if the 
 * @param param0 
 * @returns 
 */
const ShowOnMobile: React.FC<React.HTMLProps<HTMLDivElement>> = ({children, ...rest }) => {
  return <div className={styles.renderOnMobile} {...rest}>
    {children}
  </div>;
}
export default ShowOnMobile;