import React, { memo, useEffect, useState } from 'react'
import { Button, Form, Input, Space } from 'antd'
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
  tyoe?: 'string' | 'array'
  rules?: Rule[]
}

const ArrInput = memo(({ value, onChange }: any) => {
  const [state, setState] = useState<
    {
      id: string
      value: string
    }[]
  >(
    value?.map((item: string) => ({
      value: item,
      id: nanoid(),
    })) ?? [
      {
        id: nanoid(),
        value: '',
      },
    ]
  )

  useEffect(() => {
    onChange(state.map((e) => e.value))
  }, [state])

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      {state.map((item, i) => {
        return (
          <div style={{ width: '100%', display: 'flex' }} key={item.id}>
            <Input
              value={item.value}
              placeholder="请输入"
              allowClear
              onChange={(e) => {
                const newValue = [...state]
                newValue[i].value = e.target.value
                setState(newValue)
              }}
            />
            <Button
              type="link"
              onClick={() => {
                if (state.length <= 1) return
                const newValue = [...state]
                newValue.splice(i, 1)
                setState(newValue)
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
            setState((state) => [
              ...state,
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
            setState([
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

const FormItems = memo(({ data }: { data: FormTypes[] }) => {
  return (
    <>
      {data.map((item) => {
        const required = typeof item.required === 'undefined' || item.required
        const rules: Rule[] = []
        if (required) {
          rules.push({
            required: true,
            message: '当前字段为必填',
          })
        }
        if (item.tyoe === 'array' && required) {
          rules.push({
            validator(_, value: string[]) {
              if (value.every((e) => e.length)) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('请完成输入'))
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
            {item.tyoe === 'array' ? (
              <ArrInput />
            ) : (
              <Input allowClear placeholder="请输入" />
            )}
          </Form.Item>
        )
      })}
    </>
  )
})

const FromCom: React.FC<{
  data: FormTypes[]
  onFinish?: (values: any) => void
}> = ({ data, onFinish }) => {
  const [form] = Form.useForm()

  return (
    <Form
      name="basic"
      form={form}
      style={{ width: 600 }}
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      autoComplete="off"
    >
      <FormItems data={data} />
      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Space>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button
            onClick={() => {
              form.resetFields()
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
