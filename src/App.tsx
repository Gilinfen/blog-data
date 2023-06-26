import FromCom, { FormTypes } from './FromCom'
import './App.scss'
import useSocket from './hooks/useSocket'
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  Button,
  Divider,
  Dropdown,
  MenuProps,
  Popconfirm,
  Space,
  Tabs,
  Tooltip,
  message
} from 'antd'
import { SwapOutlined } from '@ant-design/icons'
import { MessageType } from './interface'

const items: Array<{
  key: string
  label: string
  value: FormTypes[]
  formData?: any
  type: MessageType['type']
}> = [
  {
    key: 'tools',
    label: `Tools`,
    type: 'tools',
    value: [
      {
        label: '名称',
        name: 'title',
        tyoe: 'string'
      },
      {
        label: '官网/仓库',
        name: 'href',
        tyoe: 'string'
      },
      {
        label: '描述',
        name: 'description',
        tyoe: 'textArea'
      },
      {
        label: '系统',
        name: 'os',
        tyoe: 'select',
        defaultValue: 'mac',
        options: [
          {
            label: 'All',
            value: 'all'
          },
          {
            label: 'Mac',
            value: 'mac'
          },
          {
            label: 'Linux',
            value: 'linuc'
          },
          {
            label: 'Windows',
            value: 'windows'
          }
        ]
      },
      {
        label: '图片',
        name: 'img',
        tyoe: 'string',
        required: false
      }
    ]
  },
  {
    key: 'npm',
    label: `Npm`,
    type: 'npm',
    value: [
      {
        label: '名称',
        name: 'title',
        tyoe: 'string'
      },
      {
        label: '官网/仓库',
        name: 'href',
        tyoe: 'string'
      },
      {
        label: 'Npm',
        name: 'npm',
        tyoe: 'string'
      },
      {
        label: 'Npm Link',
        name: 'npm-link',
        tyoe: 'string'
      },
      {
        label: '语音/框架',
        name: 'support',
        tyoe: 'select',
        defaultValue: 'js',
        options: [
          {
            label: 'All',
            value: 'js'
          },
          {
            label: 'React',
            value: 'react'
          },
          {
            label: 'Node',
            value: 'node'
          },
          {
            label: 'Vue',
            value: 'vue'
          }
        ]
      },
      {
        label: '描述',
        name: 'description',
        tyoe: 'array'
      },
      {
        label: '图片',
        name: 'img',
        tyoe: 'string',
        required: false
      }
    ]
  }
]
const Context = createContext<any>({})

function App() {
  const [dataList, setDatalist] = useState([])
  const [tabsKey, setTabKey] = useState<MessageType['type']>('tools')
  const [itemsState, setItems] = useState(items)

  const onMessage = useCallback((value: MessageEvent<string>) => {
    const res = JSON.parse(value.data) as MessageType
    switch (res.state) {
      case 'read':
        setDatalist(res.data)
        break

      case 'update':
        message.success('添加成功')
        send({
          type: res.type,
          state: 'read'
        })
        break

      case 'find':
        setItems(state => {
          const newState = [...state]
          const val = newState.find(e => e.type === res.type)
          if (val) {
            val.formData = res.data
            return newState
          }
          return [...state]
        })
        break

      default:
        break
    }
  }, [])

  const { send, link } = useSocket({
    callback: onMessage
  })

  useEffect(() => {
    if (link) {
      send({
        type: tabsKey,
        state: 'read'
      })
    }
  }, [link, tabsKey])

  const onChange = useCallback((key: string) => {
    setTabKey(key as MessageType['type'])
  }, [])

  const update = useCallback((data: string, type: MessageType['type']) => {
    send({
      data,
      type,
      state: 'find'
    })
  }, [])

  const onFinish = useCallback((data: MessageType) => {
    send(data)
  }, [])

  const confirm = useCallback((data: string, type: MessageType['type']) => {
    send({
      data,
      type,
      state: 'del'
    })
    message.success('Click on Yes')
    send({
      type,
      state: 'read'
    })
  }, [])

  const cancel = useCallback(() => {
    message.error('Click on No')
  }, [])

  const convert = useCallback(
    (
      type: MessageType['type'],
      convertType: MessageType['type'],
      href: string
    ) => {
      send({
        data: {
          convertType,
          href
        },
        type,
        state: 'convert'
      })
    },
    []
  )

  const ItemsTypeBut = memo(({ type }: { type: any }) => {
    const data = useContext(Context)
    return (
      <Button type="link" onClick={() => convert(tabsKey, type, data.href)}>
        {type}
      </Button>
    )
  })

  const ButItems: MenuProps['items'] = useMemo(
    () =>
      itemsState.map(e => ({
        key: e.key,
        label: <ItemsTypeBut type={e.type} />
      })),
    []
  )

  return (
    <div className="layout">
      <Tabs
        defaultActiveKey={tabsKey}
        tabPosition="left"
        items={itemsState.map(item => {
          return {
            key: item.key,
            label: item.label,
            children: (
              <FromCom
                onFinish={value =>
                  onFinish({
                    data: value,
                    state: 'update',
                    type: item.type
                  })
                }
                value={item.formData}
                data={item.value}
              />
            )
          }
        })}
        onChange={onChange}
      />
      <ol>
        <Divider plain>
          <h2>{dataList.length}</h2>
        </Divider>
        {dataList.map((item: any, i) => {
          return (
            <li key={item.title}>
              <h4>
                <Tooltip
                  placement="topLeft"
                  title={
                    typeof item.description === 'string'
                      ? item.description
                      : item.description.map((e: string) => <p>{e}</p>)
                  }
                >
                  <Space>
                    <div style={{ width: 30, textAlign: 'center' }}>
                      {i + 1}
                    </div>
                    <a href={item.href} target="_blank">
                      {item.title}
                    </a>
                  </Space>
                </Tooltip>
                <div className="tools">
                  <Button
                    type="link"
                    onClick={() => update(item.href, tabsKey)}
                  >
                    编辑
                  </Button>
                  <Context.Provider value={item}>
                    <Dropdown
                      menu={{ items: ButItems }}
                      placement="bottom"
                      arrow
                    >
                      <Button type="link" icon={<SwapOutlined />} />
                    </Dropdown>
                  </Context.Provider>
                  <Popconfirm
                    title={`删除`}
                    description={
                      <Space>
                        确定要删除
                        <h4>{item.title}</h4>
                        吗？
                      </Space>
                    }
                    onCancel={cancel}
                    onConfirm={() => confirm(item.href, tabsKey)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button danger type="link">
                      DELETE
                    </Button>
                  </Popconfirm>
                </div>
              </h4>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default App
