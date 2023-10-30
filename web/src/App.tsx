import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import styles from './index.module.scss'
import Npm from '../data/npm.json'
import Tools from '../data/tools.json'
import Vscode from '../data/vscode.json'

type ToolsData = {
  id: string
  title: string
  href: string
  description: string | string[]
  img?: string
  support?: string
  video?: string
}

type NpmData = {
  id: string
  title: string
  href: string
  description: string | string[]
  img?: string
  npm: string
  'npm-link': string
  support?: string
}
type GetToolsType = 'tools' | 'npm' | 'vscode'

type ToolsItemType = ToolsData | NpmData

const data: {
  label: GetToolsType
  value: ToolsItemType[]
}[] = [
  {
    label: 'npm',
    value: Npm
  },
  {
    label: 'tools',
    value: Tools as ToolsItemType[]
  },
  {
    label: 'vscode',
    value: Vscode
  }
]
const toFirstUpperCase = (name: string) =>
  name
    .split('-')
    .map(e => e.charAt(0).toUpperCase() + e.slice(1))
    .join('')

const MemoImg = memo(({ title, img }: { title: string; img: string }) => {
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (imgRef.current) {
      const observer = new IntersectionObserver(observers => {
        if (observers[0].isIntersecting && imgRef.current) {
          imgRef.current.src = imgRef.current.getAttribute('data-src') ?? ''
          observer.unobserve(imgRef.current)
        }
      })
      observer.observe(imgRef.current)
    }
  }, [img])

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={imgRef} data-src={img} alt={title} />
  )
})

const ArrayImage = memo(
  ({ img, title }: { img?: string | string[]; title: string }) => {
    if (typeof img === 'string') {
      return <MemoImg title={title} img={img} />
    } else if (img && img.some(e => e)) {
      return img.map((item, i) => <MemoImg key={i} title={title} img={item} />)
    }
  }
)

const Video = memo(
  (
    props: React.DetailedHTMLProps<
      React.VideoHTMLAttributes<HTMLVideoElement>,
      HTMLVideoElement
    >
  ) => {
    const { src } = props
    return (
      <video playsInline controls>
        <source src={src} />
      </video>
    )
  }
)

const ToolsItem = memo((props: ToolsItemType) => {
  const { title, href, description, img, support } = props
  const { npm, 'npm-link': npm_link } = props as NpmData
  const { video } = props as ToolsData

  return (
    <div className="tools-item">
      <h1>
        <a href={href} target="_blank">
          {toFirstUpperCase(title)}
        </a>
      </h1>
      {npm && (
        <>
          <a href={npm_link} className=" text-red-700" target="_blank">
            npm : {npm}
          </a>
          {support && <span>{support}</span>}
        </>
      )}
      {typeof description === 'string' ? (
        <p>{description}</p>
      ) : (
        <>
          {description.map(item => (
            <p key={item}>{item}</p>
          ))}
        </>
      )}
      <ArrayImage img={img} title={title} />
      {video && <Video src={video} />}
    </div>
  )
})

function App() {
  const [list, setList] = useState<(typeof data)[number]['value'][number][]>(
    data[1].value
  )
  const [type, setType] = useState<GetToolsType>('tools')

  const [inputValue, setInputValue] = useState('')

  const camelCaseToLowerCase = useCallback(
    (str: string): string =>
      str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
    []
  )

  const filterArray = useCallback(
    (searchString: string, mtype: typeof type): typeof list => {
      const searchStringLower = searchString.toLowerCase() // 将搜索字符串转换为小写
      return (data.find(e => e.label === mtype)?.value ?? []).filter(obj => {
        const titleLowerCase = camelCaseToLowerCase(obj.title) // 将标题字段转换为小写和连字符
        const titleMatch = titleLowerCase.includes(searchStringLower) // 进行小写比较
        let descriptionMatch = false

        if (typeof obj.description === 'string') {
          // 如果description是字符串，直接比较
          descriptionMatch = obj.description
            .toLowerCase()
            .includes(searchStringLower)
        } else if (Array.isArray(obj.description)) {
          // 如果description是字符串数组，检查数组中的每个字符串是否包含搜索字符串
          descriptionMatch = obj.description.some(desc =>
            desc.toLowerCase().includes(searchStringLower)
          )
        }

        return titleMatch || descriptionMatch
      })
    },
    [data]
  )

  // const dataList = useMemo(
  //   () => data.reduce((p: any, e) => [...p, ...e.value], []),
  //   [data]
  // )

  useEffect(() => {
    setList(filterArray(inputValue.trim(), type))
  }, [inputValue, filterArray, setList])

  const onChange = useCallback((val: any) => {
    const value = val.target.value as string
    setInputValue(value)
  }, [])

  return (
    <div className={styles.root}>
      <header className="tools-header">
        {data.map(item => (
          <h1
            key={item.label}
            className={clsx(
              type === item.label ? 'header-active' : '',
              'header-item'
            )}
            onClick={() => {
              setList(filterArray(inputValue, item.label))
              setType(item.label)
            }}
          >
            {toFirstUpperCase(item.label)}
          </h1>
        ))}
      </header>
      <input className="search" value={inputValue} onChange={onChange} />
      <main className="tools-main">
        {list.map(item => (
          <ToolsItem {...item} key={item.id} />
        ))}
      </main>
    </div>
  )
}

export default App
