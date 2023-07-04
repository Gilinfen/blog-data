import { MenuOutlined } from '@ant-design/icons'
import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Table } from 'antd'
import type { ColumnsType, TableProps } from 'antd/es/table'
import React, { useEffect, useState } from 'react'

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string
}

const Row = ({ children, ...props }: RowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: props['data-row-key']
  })

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {})
  }

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, child => {
        if ((child as React.ReactElement).key === 'sort') {
          return React.cloneElement(child as React.ReactElement, {
            children: (
              <MenuOutlined
                ref={setActivatorNodeRef}
                style={{ touchAction: 'none', cursor: 'move' }}
                {...listeners}
              />
            )
          })
        }
        return child
      })}
    </tr>
  )
}

export type DragLinkProps<DataSource> = {
  columns: ColumnsType<DataSource>
  sortChange?: (value: DataSource[]) => void
  dataSource: DataSource[]
  pageSize: number
}

const DragLink = <
  DataSource extends {
    key: string | number
    id: string
    [key: string]: any
  }
>({
  dataSource: data,
  columns,
  sortChange,
  pageSize,
  ...agrs
}: DragLinkProps<DataSource> & TableProps<DataSource>) => {
  const [dataSource, setDataSource] = useState(data)

  useEffect(() => {
    setDataSource(data)
  }, [data])

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      setDataSource(previous => {
        const activeIndex = previous.findIndex(i => i.key === active.id)
        const overIndex = previous.findIndex(i => i.key === over?.id)
        const sortValue = arrayMove(previous, activeIndex, overIndex)
        sortChange?.(sortValue)
        return sortValue
      })
    }
  }

  return (
    <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext
        // rowKey array
        items={dataSource.map(i => i.key)}
        strategy={verticalListSortingStrategy}
      >
        <Table
          {...agrs}
          components={{
            body: {
              row: Row
            }
          }}
          pagination={{
            position: ['none'] as any[],
            pageSize
          }}
          rowKey="key"
          columns={columns}
          dataSource={dataSource}
        />
      </SortableContext>
    </DndContext>
  )
}

export default DragLink
