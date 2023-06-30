export type MessageType = {
  data?: any
  state?: 'read' | 'find' | 'del' | 'update' | 'success' | 'convert'
  type: 'npm' | 'tools' | 'vscode'
}

export type DataParams = {
  title: string
  [key: string]: any
}
