import React, { memo, useCallback, useEffect, useState } from 'react'
import { Button, Form, Input, Select, Space } from 'antd'
import { Rule } from 'antd/es/form'
import { nanoid } from 'nanoid'
import { MenuOutlined } from '@ant-design/icons'

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
  tyoe: 'string' | 'array' | 'select' | 'textArea'
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

const ArrInput = memo<BaseInput>(({ value, onChange }) => {
  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {(value as string[])?.map((item, i) => {
        return (
          <div
            style={{ width: '100%', display: 'flex', alignItems: 'center' }}
            key={i}
          >
            <MenuOutlined
              style={{
                cursor: 'grab',
                marginRight: '10px'
              }}
            />
            <Input
              value={item}
              placeholder="请输入"
              allowClear
              onChange={e => {
                const newValue = [...value]
                newValue[i] = e.target.value
                onChange(newValue)
              }}
            />
            <Button
              type="link"
              onClick={() => {
                if (value.length <= 1) return
                const newValue = [...value]
                newValue.splice(i, 1)
                onChange(newValue)
              }}
            >
              删除
            </Button>
          </div>
        )
      })}
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
        textArea: item.defaultValue ?? void 0
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
        setFormID(void 0)
      }}
      onChange={() => setInit(false)}
      autoComplete="off"
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
