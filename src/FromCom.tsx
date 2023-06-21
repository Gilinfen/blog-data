import React, { memo, useEffect, useState } from 'react'
import { Button, Form, Input, Select, Space } from 'antd'
import { Rule } from 'antd/es/form'
import { nanoid } from 'nanoid'

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
  tyoe: 'string' | 'array' | 'select'
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
      {((value ?? ['']) as string[]).map((item, i) => {
        return (
          <div style={{ width: '100%', display: 'flex' }} key={nanoid()}>
            <Input
              value={item}
              placeholder="请输入"
              allowClear
              onChange={(e) => {
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
          display: 'flex',
        }}
      >
        <Button
          block
          onClick={() =>
            onChange([
              ...value,
              {
                id: nanoid(),
                value: '',
              },
            ])
          }
        >
          添加
        </Button>
        <Button
          type="link"
          onClick={() =>
            onChange([
              {
                id: nanoid(),
                value: '',
              },
            ])
          }
        >
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
  }
  return Com[item.tyoe]
})

const FormItems = memo(
  ({ data, dynamicCheck }: { data: FormTypes[]; dynamicCheck: boolean }) => {
    return (
      <>
        {data.map((item) => {
          const required = typeof item.required === 'undefined' || item.required
          const rules: Rule[] = []
          if (required) {
            rules.push({
              required: true,
              message: `请输入${item.label}`,
            })
          }
          if (item.tyoe === 'array' && required) {
            rules.push({
              validator(_, value: string[]) {
                if (dynamicCheck) return Promise.resolve()
                if (value.every((e) => e.length)) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error(`请输入${item.label}`))
              },
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
  onFinish?: (values: any) => void
}> = ({ data, value, onFinish }) => {
  const [form] = Form.useForm()
  const [dynamicCheck, setInit] = useState(true)
  useEffect(() => {
    if (value) {
      form.setFieldsValue(value)
    }
  }, [value])
  return (
    <Form
      name={nanoid()}
      form={form}
      style={{ width: 600 }}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
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
          <Button
            onClick={() => {
              form.resetFields()
              setInit(true)
            }}
          >
            Clear
          </Button>
        </Space>
      </Form.Item>
    </Form>
  )
}
export default FromCom
