import { useCallback, useEffect, useState } from 'react'
import { MessageType } from '../interface'

const port = process.env.port

const ws = new WebSocket(`ws://localhost:${port}`)

export default function UseSocket({
  callback
}: {
  callback: (value: MessageEvent<any>) => void
}) {
  const [state] = useState<WebSocket>(ws)
  const [link, setLink] = useState(false)

  const send = useCallback((value: MessageType) => {
    state.send(JSON.stringify(value))
  }, [])

  useEffect(() => {
    // 连接建立时的处理
    ws.onopen = () => {
      // console.log('已连接到 WebSocket 服务器')
      setLink(true)
    }

    // 接收服务器消息的处理
    ws.onmessage = event => {
      callback(event)
    }

    // 连接关闭时的处理
    ws.onclose = () => {
      console.log('连接已关闭')
      setLink(false)
    }
  }, [])

  return {
    ws: state,
    send,
    link
  }
}
