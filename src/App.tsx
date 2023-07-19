import FromCom, { FormTypes } from './FromCom'
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
import { v4 } from 'uuid'
import DragLink, { DragLinkProps } from './components/dragLink'
import './App.scss'

const defaultValue: FormTypes[] = [
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
    tyoe: 'array'
  },
  {
    label: '图片',
    name: 'img',
    tyoe: 'string',
    required: false
  },
  {
    label: '视频',
    name: 'video',
    tyoe: 'string',
    required: false
  }
]

const items: Array<{
  key: MessageType['type']
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
      ...defaultValue,
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
      }
    ]
  },
  {
    key: 'npm',
    label: `Npm`,
    type: 'npm',
    value: [
      ...defaultValue,
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
      }
    ]
  },
  {
    key: 'vscode',
    label: 'Vscode',
    type: 'vscode',
    value: [...defaultValue]
  }
]

interface DataListProps {
  key: string
  id: string
  title: string
}

const Context = createContext<any>({})

function App() {
  const [dataList, setDatalist] = useState<any[]>([])
  const [tabsKey, setTabKey] = useState<MessageType['type']>('tools')
  const [itemsState, setItems] = useState(items)

  const onMessage = useCallback((value: MessageEvent<string>) => {
    const res = JSON.parse(value.data) as MessageType
    switch (res.state) {
      case 'read':
        setDatalist(res.data)
        break

      case 'update':
        send({
          type: res.type,
          state: 'read'
        })
        message.success('导入成功')
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
      case 'convert':
        setDatalist(res.data)
        message.success('切换成功')
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

  const onFinish = useCallback(async (data: MessageType) => {
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
      id: string
    ) => {
      send({
        data: {
          convertType,
          id
        },
        type,
        state: 'convert'
      })
    },
    []
  )

  const ItemsTypeBut = memo(
    ({ type, tabsKey }: { type: any; tabsKey: any }) => {
      const data = useContext(Context)
      return (
        <Button type="link" onClick={() => convert(tabsKey, type, data.id)}>
          {type}
        </Button>
      )
    }
  )

  const ButItems: MenuProps['items'] = useMemo(
    () =>
      itemsState.map(e => ({
        key: e.key,
        label: <ItemsTypeBut type={e.type} tabsKey={tabsKey} />
      })),
    [tabsKey]
  )

  const columns = useMemo<DragLinkProps<DataListProps>['columns']>(() => {
    return [
      {
        key: 'sort',
        width: 40
      },
      {
        title: '名称',
        dataIndex: 'title',
        ellipsis: true,
        render(_, item: any) {
          return (
            <Tooltip
              placement="topLeft"
              title={
                typeof item.description === 'string'
                  ? item.description
                  : item.description.map((e: string) => <p key={v4()}>{e}</p>)
              }
            >
              <a href={item.href} target="_blank">
                {item.title}
              </a>
            </Tooltip>
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'option',
        width: '220px',
        render(_, item: any) {
          return (
            <>
              <Button type="link" onClick={() => update(item.id, tabsKey)}>
                编辑
              </Button>
              <Context.Provider value={item}>
                <Dropdown menu={{ items: ButItems }} placement="bottom" arrow>
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
                onConfirm={() => confirm(item.id, tabsKey)}
                okText="Yes"
                cancelText="No"
              >
                <Button danger type="link">
                  DELETE
                </Button>
              </Popconfirm>
            </>
          )
        }
      }
    ]
  }, [dataList])

  const dataSource = useMemo(
    () =>
      dataList.map((item, i) => ({
        ...item,
        key: i + 1
      })),
    [dataList]
  )

  return (
    <div className="layout">
      <div>
        <Divider plain>
          <h2> {tabsKey.toLocaleUpperCase()} </h2>
        </Divider>
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
      </div>
      <ol>
        <Divider plain>
          <h2>{dataList.length}</h2>
        </Divider>
        <DragLink<DataListProps>
          pageSize={dataList.length}
          size="small"
          showHeader={false}
          dataSource={dataSource}
          columns={columns}
        />
      </ol>
    </div>
  )
}

export default App
