import { memo, useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import styles from './index.module.scss'
import Npm from '../../data/npm.json'
import Tools from '../../data/tools.json'
import Vscode from '../../data/vscode.json'

type ToolsData = {
  id: string
  title: string
  href: string
  description: string | string[]
  img?: string
  support?: string
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
    } else if (img) {
      return img.map(item => <MemoImg key={item} title={title} img={item} />)
    }
  }
)

const ToolsItem = memo((props: ToolsItemType) => {
  const { title, href, description, img, support } = props
  const { npm, 'npm-link': npm_link } = props as NpmData

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
          {description.map((item, i) => (
            <p key={i}>{item}</p>
          ))}
        </>
      )}
      <ArrayImage img={img} title={title} />
    </div>
  )
})

function App() {
  const [list, setList] = useState<(typeof data)[number]['value'][number][]>(
    data[0].value
  )
  const [type, setType] = useState<GetToolsType>('tools')

  return (
    <div className={styles.root}>
      <header className="tools-header">
        {data.map((item, i) => (
          <h1
            key={i}
            className={clsx(
              type === item.label ? 'header-active' : '',
              'header-item'
            )}
            onClick={() => {
              setList(item.value)
              setType(item.label)
            }}
          >
            {toFirstUpperCase(item.label)}
          </h1>
        ))}
      </header>
      <main className="tools-main">
        {list.map(item => (
          <ToolsItem key={item.id} {...item} />
        ))}
      </main>
    </div>
  )
}

export default App
