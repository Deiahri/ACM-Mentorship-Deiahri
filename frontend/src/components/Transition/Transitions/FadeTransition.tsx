export default function FadeTransition({ tV, children, forceStyle, forceClass }: { tV: number, children?: React.ReactNode, forceStyle?: React.CSSProperties, forceClass?: string }) {
    return <div style={{ opacity: tV, ...forceStyle }} className={forceClass}>
        {children}
    </div>
}