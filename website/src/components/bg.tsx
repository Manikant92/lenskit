import classNames from 'classnames'
import cs from 'classnames'
import clsx from 'classnames'

export function BlurSvg({
    colors = ['#e2ff2399', '#ff6c6c99', '#ff17c999'],
    className = '',
}) {
    let opacity = 0.5
    let w = 800
    let start = 100
    let middle = w / 2
    let end = w - 100
    let blur = 100
    let [cs, cm, ce] = colors
    let radius = 120
    return (
        // gradient on black looks bad if too noticeable
        <div className={classNames('dark:opacity-50', className)}>
            <svg
                xmlns='http://www.w3.org/2000/svg'
                version='1.1'
                xmlnsXlink='http://www.w3.org/1999/xlink'
                className={clsx('w-full origin-top mx-auto lg:scale-100 dark:saturate-200', 'dark:brightness-150 scale-[150%]')}
                style={{ opacity }}
                viewBox={`0 0 ${w} 650`}
            >
                <defs>
                    <filter
                        id='bbblurry-filter'
                        x='-100%'
                        y='-100%'
                        width='400%'
                        height='400%'
                        filterUnits='objectBoundingBox'
                        primitiveUnits='userSpaceOnUse'
                        colorInterpolationFilters='sRGB'
                    >
                        <feGaussianBlur
                            stdDeviation={blur}
                            x='0%'
                            y='0%'
                            width='100%'
                            height='100%'
                            in='SourceGraphic'
                            edgeMode='none'
                            result='blur'
                        />
                    </filter>
                </defs>
                <g filter='url(#bbblurry-filter)'>
                    <ellipse
                        rx={radius * 0.8}
                        ry={radius * 0.8}
                        cx={start}
                        cy='172.91720581054688'
                        fill={cs}
                    />
                    <ellipse
                        rx={radius}
                        ry={radius}
                        cx={middle}
                        cy='0'
                        fill={cm}
                    />
                    <ellipse
                        rx={radius * 0.8}
                        ry={radius * 0.8}
                        cx={end}
                        cy='172.91720581054688'
                        fill={ce}
                    />
                </g>
            </svg>
        </div>
    )
}
