# Blog-Data

## Tools

> data\tools.json

```ts
export type ToolsData = {
  title: string
  href: string
  description: string | string[]
  img?: string
  support?: string
}
```

## npm

> data\npm.json

```ts
export type NpmData = {
  title: string
  href: string
  description: string | string[]
  img?: string
  npm: string
  'npm-link': string
  support?: string
}
```
