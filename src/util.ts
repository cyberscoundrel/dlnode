type AnyFn = (...args: unknown[]) => unknown
export type ClassProperties<C> = {
    [K in keyof C as C[K] extends AnyFn | ((m: any) => void)[] ? never : K]: C[K]
}

export type Props<T> = ClassProperties<T>