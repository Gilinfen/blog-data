import { readFileSync, writeFileSync } from 'fs'
import WebSocket from 'ws'
import { MessageType } from './src/interface'

// 创建WebSocket服务器
const wss = new WebSocket.Server({ port: 4000 })

const dataFiles = {
  npm: './data/npm.json',
  tools: './data/tools.json',
}

function witleFiles(parms: any, type: MessageType['type']) {
  const value = readFileSync(dataFiles[type], 'utf-8') ?? '[]'
  writeFileSync(dataFiles[type], JSON.stringify([parms, ...JSON.parse(value)]))
}

function readFile(type: MessageType['type']) {
  const value = readFileSync(dataFiles[type], 'utf-8') ?? '[]'
  return value
}

// 监听连接事件
wss.on('connection', (ws) => {
  console.log('---------- 客户端已连接 ----------')

  // 接收客户端消息
  ws.on('message', (message) => {
    const req = JSON.parse(message.toString('utf-8')) as unknown as MessageType
    if (req.read) {
      // 向客户端发送响应
      ws.send(readFile(req.type))
      return
    }
    witleFiles(req.data, req.type)
    // 向客户端发送响应
    ws.send('success')
  })

  // 监听连接断开事件
  ws.on('close', () => {
    console.log('客户端已断开连接')
  })
})
