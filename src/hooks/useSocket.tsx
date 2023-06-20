import { useCallback, useEffect, useState } from 'react'
import { MessageType } from '../interface'

const ws = new WebSocket('ws://localhost:4000')

export default function UseSocket({
  callback,
}: {
  callback: (value: MessageEvent<any>) => void
}) {
  const [state] = useState<WebSocket>(ws)

  const send = useCallback((value: MessageType) => {
    state.send(JSON.stringify(value))
  }, [])

  useEffect(() => {
    // 连接建立时的处理
    ws.onopen = () => {
      console.log('已连接到 WebSocket 服务器')
    }

    // 接收服务器消息的处理
    ws.onmessage = (event) => {
      callback(event)
    }

    // 连接关闭时的处理
    ws.onclose = () => {
      console.log('连接已关闭')
    }
  }, [])

  return {
    ws: state,
    send,
  }
}
