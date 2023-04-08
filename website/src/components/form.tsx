import classNames from 'classnames'
import { ComponentPropsWithRef, forwardRef } from 'react'

export const Input = forwardRef<any, ComponentPropsWithRef<'input'>>(
    function Textarea({ className, ...rest }, ref) {
        return (
            <input
                ref={ref}
                className={classNames(
                    'w-full tracking-wide text-gray-900 ',
                    'rounded-lg px-2.5 py-[6px] border-gray-300 focus:ring-2 block',
                    'bg-gray-50 focus:ring-gray-400/70 ring-1 ring-gray-200 dark:ring-gray-800 focus:border-gray-500',
                    'dark:text-white dark:placeholder-gray-400',
                    'dark:focus:ring-gray-500 dark:focus:ring-gray-500 ',
                    ' dark:bg-gray-700',
                    className,
                )}
                {...rest}
            />
        )
    },
)

export const Button = forwardRef<
    any,
    ComponentPropsWithRef<'button'> & { isLoading?: boolean }
>(function Button({ className, children, isLoading = false, ...rest }, ref) {
    return (
        <button
            type='button'
            className={classNames(
                'w-full text-white text-center rounded-lg px-4 transition-colors',
                'justify-center items-center font-semibold dark:text-white',
                'flex dark:bg-gray-700 sm:w-auto dark:hover:bg-gray-800 hover:bg-gray-300',
                'focus:ring-gray-300 focus:ring-2 focus:outline-none',
                'dark:hover:bg-gray-700 dark:focus:ring-gray-500',
                'dark:bg-gray-600 min-w-[140px] min-h-[42px] bg-gray-200 text-gray-800',
            )}
            {...rest}
        >
            {isLoading ? <Spinner /> : children}
        </button>
    )
})

export function GhostButton({
    className,
    ...rest
}: ComponentPropsWithRef<'button'>) {
    return (
        <button
            className={classNames(
                'p-2 py-[6px] ',
                'max-w-max justify-center font-medium items-center shrink-0 min-h-[34px]',
                'flex gap-2 ease-in-out appearance-none active:opacity-100',
                'duration-[300ms] whitespace-nowrap hover:bg-gray-100 dark:hover:bg-gray-800 transition-all rounded',
                className,
            )}
            type='button'
            {...rest}
        />
    )
}

export function Spinner({ className = '' }) {
    return (
        <>
            <style jsx>{`
                .spinner {
                    position: relative;
                    pointer-events: none;
                }

                .spinner::after {
                    content: '';
                    position: absolute !important;
                    top: calc(50% - (1em / 2));
                    left: calc(50% - (1em / 2));
                    display: block;
                    width: 1em;
                    height: 1em;
                    border: 2px solid currentColor;
                    border-radius: 9999px;
                    border-right-color: transparent;
                    border-top-color: transparent;
                    animation: spinAround 500ms infinite linear;
                }

                @keyframes spinAround {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>

            <div className={classNames('spinner w-5 h-5', className)} />
        </>
    )
}
