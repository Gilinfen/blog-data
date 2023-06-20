import FromCom, { FormTypes } from './FromCom'
import './App.scss'
import useSocket from './hooks/useSocket'
import { useCallback } from 'react'
import { Tabs, message } from 'antd'
import { MessageType } from './interface'

const onChange = (key: string) => {
  console.log(key)
}

const items: Array<{
  key: string
  label: string
  value: FormTypes[]
  type: MessageType['type']
}> = [
  {
    key: 'Tools',
    label: `Tools`,
    type: 'tools',
    value: [
      {
        label: 'title',
        name: 'title',
      },
      {
        label: 'href',
        name: 'href',
      },
      {
        label: 'description',
        name: 'description',
        tyoe: 'array',
      },
      {
        label: 'img',
        name: 'img',
        required: false,
      },
    ],
  },
  {
    key: 'Npm',
    label: `Npm`,
    type: 'npm',
    value: [
      {
        label: 'title',
        name: 'title',
      },
      {
        label: 'href',
        name: 'href',
      },
      {
        label: 'description',
        name: 'description',
        tyoe: 'array',
      },
      {
        label: 'img',
        name: 'img',
        required: false,
      },
    ],
  },
]

function App() {
  const onMessage = useCallback((value: MessageEvent<any>) => {
    console.log(value)
    message.success('添加成功')
  }, [])

  const { send } = useSocket({
    callback: onMessage,
  })
  const onFinish = (data: MessageType) => {
    send(data)
  }
  return (
    <div className="layout">
      <Tabs
        defaultActiveKey="Tools"
        tabPosition="left"
        items={items.map((item) => {
          return {
            key: item.key,
            label: item.label,
            children: (
              <FromCom
                onFinish={(value) =>
                  onFinish({
                    data: value,
                    type: item.type,
                  })
                }
                data={item.value}
              />
            ),
          }
        })}
        onChange={onChange}
      />
    </div>
  )
}

export default App
