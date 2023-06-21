export type MessageType = {
  data?: any
  state?: 'read' | 'find' | 'del' | 'update' | 'success'
  type: 'npm' | 'tools'
}

export type DataParams = {
  title: string
  [key: string]: any
}
