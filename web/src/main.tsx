import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import {
  renderWithQiankun,
  qiankunWindow
} from 'vite-plugin-qiankun/dist/helper'

function render(props: any) {
  const { container } = props
  const root = container
    ? container.querySelector('#root')
    : document.querySelector('#root')

  ReactDOM.createRoot(root as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

renderWithQiankun({
  mount(props) {
    console.log('mount', props)
    render(props)
  },
  bootstrap() {
    console.log('bootstrap')
  },
  unmount(props) {
    console.log('unmount', props)
  },
  update(props) {
    console.log('update', props)
  }
})

export const isQiankun = qiankunWindow.__POWERED_BY_QIANKUN__

// 当前应用程序是否在 qiankun 容器中运行，如果不在，就挂载到当前项目的 #app 中
if (!isQiankun) {
  render({})
}
