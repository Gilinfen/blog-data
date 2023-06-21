import { readFileSync, writeFileSync } from 'fs'
import WebSocket from 'ws'
import { DataParams, MessageType } from './src/interface'

// 创建WebSocket服务器
const wss = new WebSocket.Server({ port: 4000 })

const dataFiles = {
  npm: './data/npm.json',
  tools: './data/tools.json',
}

function readFile(type: MessageType['type']): any[] {
  const value = readFileSync(dataFiles[type], 'utf-8') ?? '[]'
  return JSON.parse(value)
}

function witleFiles(parms: DataParams, type: MessageType['type']) {
  const value = readFile(type)
  const index = value.findIndex((e) => e.title === parms.title)
  if (index > -1) {
    value[index] = parms
    writeFileSync(dataFiles[type], JSON.stringify(value))
    return
  }
  writeFileSync(dataFiles[type], JSON.stringify([parms, ...value]))
}

function deleteFile(title: string, type: MessageType['type']) {
  const value = readFile(type)
  writeFileSync(
    dataFiles[type],
    JSON.stringify(value.filter((e: any) => e.title !== title))
  )
}

function updateFile(title: string, type: MessageType['type']) {
  const res = readFile(type)
  return {
    data: res.find((e) => e.title === title),
    type,
  }
}

function renterRes(parms: MessageType) {
  return JSON.stringify(parms)
}

// 监听连接事件
wss.on('connection', (ws) => {
  console.log('---------- 客户端已连接 ----------')
  // 接收客户端消息
  ws.on('message', (message) => {
    const req = JSON.parse(message.toString('utf-8')) as unknown as MessageType

    switch (req.state) {
      case 'read':
        ws.send(
          renterRes({
            data: readFile(req.type),
            state: req.state,
            type: req.type,
          })
        )
        break

      case 'update':
        witleFiles(req.data, req.type)
        // 向客户端发送响应
        ws.send(
          renterRes({
            state: req.state,
            type: req.type,
          })
        )
        break

      case 'del':
        deleteFile(req.data, req.type)
        break

      case 'find':
        const res = updateFile(req.data, req.type)
        ws.send(
          renterRes({
            ...res,
            state: req.state,
          })
        )
        break

      default:
        break
    }
  })

  // 监听连接断开事件
  ws.on('close', () => {
    console.log('-------- 客户端已断开连接 --------')
  })
})
