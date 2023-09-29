import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { Button, DatePicker, Form, Input, Select, Space } from 'antd'
import dayjs from 'dayjs'
import { Rule } from 'antd/es/form'
import { nanoid } from 'nanoid'
import DragLink, { DragLinkProps } from './components/dragLink'
import styles from './form.module.scss'

const { TextArea } = Input

export type FormTypes = {
  label: string
  name: string
  /**
   * 默认开启
   */
  required?: boolean
  /**
   * 默认为 string
   */
  tyoe: 'string' | 'array' | 'select' | 'textArea' | 'date'
  options?: {
    label: string
    value: string
  }[]
  defaultValue?: string
  rules?: Rule[]
}

type BaseInput = {
  value: any
  item: FormTypes
  onChange: (...angs: any) => void
}

const SelectInput = memo<BaseInput>(({ value, onChange, item }) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      allowClear
      placeholder="请选择"
      defaultValue={item.defaultValue}
      options={item.options}
    />
  )
})

interface DataListProps {
  key: number
  id: string
  value: string
}

const ArrInput = memo<BaseInput>(({ value: strVal, onChange }) => {
  const value = typeof strVal === 'string' ? [strVal] : strVal
  const [dataSource, setDataSource] = useState<DataListProps[]>([
    {
      key: 1,
      id: nanoid(),
      value: ''
    }
  ])

  useEffect(() => {
    if (value) {
      setDataSource(
        (value as string[]).map((v, i) => {
          return {
            key: i + 1,
            id: nanoid(),
            value: v
          }
        })
      )
    }
  }, [value])

  const columns = useMemo<DragLinkProps<DataListProps>['columns']>(() => {
    return [
      {
        key: 'sort',
        width: 40
      },
      {
        dataIndex: 'value',
        render(_, __, index) {
          return (
            <Input
              value={_}
              placeholder="请输入"
              allowClear
              onChange={e => {
                const newValue = [...value]
                newValue[index] = e.target.value
                onChange(newValue)
              }}
            />
          )
        }
      },
      {
        title: '操作',
        dataIndex: 'option',
        width: '80px',
        render(_, __, index) {
          return (
            <Button
              type="link"
              onClick={() => {
                if (value.length <= 1) return
                const newValue = [...value]
                newValue.splice(index, 1)
                onChange(newValue)
              }}
            >
              删除
            </Button>
          )
        }
      }
    ]
  }, [value])

  const sortChange = useCallback(
    (val: DataListProps[]) => {
      onChange(val.map(e => e.value))
    },
    [onChange]
  )

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <DragLink<DataListProps>
        pageSize={dataSource.length}
        sortChange={sortChange}
        showHeader={false}
        size="small"
        dataSource={dataSource}
        columns={columns}
      />
      <div
        style={{
          width: '100%',
          display: 'flex'
        }}
      >
        <Button block onClick={() => onChange([...(value ?? []), ''])}>
          添加
        </Button>
        <Button type="link" onClick={() => onChange([''])}>
          清空
        </Button>
      </div>
    </Space>
  )
})

const DateCom = memo<BaseInput>(({ value, ...args }) => {
  return (
    <DatePicker
      {...args}
      value={dayjs(value ?? new Date())}
      style={{
        width: '100%'
      }}
      placeholder="请选择"
    />
  )
})

const StateInput = memo<{ item: FormTypes }>(({ item, ...args }) => {
  const Com: {
    [key in FormTypes['tyoe']]: any
  } = {
    string: (
      <Input
        {...args}
        defaultValue={item.defaultValue}
        allowClear
        placeholder="请输入"
      />
    ),
    date: <DateCom item={item} {...(args as Omit<BaseInput, 'item'>)} />,
    array: <ArrInput item={item} {...(args as Omit<BaseInput, 'item'>)} />,
    select: <SelectInput item={item} {...(args as Omit<BaseInput, 'item'>)} />,
    textArea: (
      <TextArea
        {...args}
        defaultValue={item.defaultValue}
        allowClear
        placeholder="请输入"
      />
    )
  }
  return Com[item.tyoe]
})

const FormItems = memo(
  ({ data, dynamicCheck }: { data: FormTypes[]; dynamicCheck: boolean }) => {
    return (
      <>
        {data.map(item => {
          const required = typeof item.required === 'undefined' || item.required
          const rules: Rule[] = []
          if (required) {
            rules.push({
              required: true,
              message: `请输入${item.label}`
            })
          }
          if (item.tyoe === 'array' && required) {
            rules.push({
              validator(_, value: string[]) {
                if (dynamicCheck) return Promise.resolve()
                if (value.every(e => e.length)) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error(`请输入${item.label}`))
              }
            })
          }
          rules.push(...(item.rules ?? []))
          return (
            <Form.Item
              key={item.name}
              label={item.label}
              name={item.name}
              rules={rules}
              className={item.tyoe === 'array' ? styles['arr-input'] : ''}
            >
              <StateInput item={item} />
            </Form.Item>
          )
        })}
      </>
    )
  }
)

const FromCom: React.FC<{
  data: FormTypes[]
  value?: any
  onFinish?: (values: any) => Promise<void>
}> = ({ data, value, onFinish }) => {
  const [formID, setFormID] = useState<string>()
  const [form] = Form.useForm()
  const [dynamicCheck, setInit] = useState(true)

  useEffect(() => {
    if (value) {
      setFormID(value.id ?? nanoid())
    } else {
      setFormID(nanoid())
    }
  }, [value])

  const onClear = useCallback(() => {
    form.resetFields()
    setInit(true)
    const initValue = data.reduce((pre, item) => {
      const types: {
        [key in FormTypes['tyoe']]: any
      } = {
        array: item.defaultValue ?? [''],
        string: item.defaultValue ?? void 0,
        select: item.defaultValue ?? void 0,
        textArea: item.defaultValue ?? void 0,
        date: item.defaultValue ?? void 0
      }
      return {
        ...pre,
        [item.name]: types[item.tyoe]
      }
    }, {})
    form.setFieldsValue(initValue)
  }, [data])

  useEffect(() => {
    if (value) {
      form.setFieldsValue(value)
    } else {
      onClear()
    }
  }, [value, onClear])
  return (
    <Form
      name={formID}
      form={form}
      style={{ width: 600 }}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      initialValues={{ remember: true }}
      onFinish={async formValue => {
        await onFinish?.({
          ...formValue,
          id: formID
        })
        onClear()
        setFormID(nanoid())
      }}
      onChange={() => setInit(false)}
      autoComplete="off"
      className={styles.root}
    >
      <FormItems data={data} dynamicCheck={dynamicCheck} />
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Space>
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => setInit(false)}
          >
            Submit
          </Button>
          <Button onClick={onClear}>Clear</Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
export default FromCom
