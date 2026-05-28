'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ItemCard, { Action } from '@/components/ItemCard';
import { Item } from '@/lib/types';

interface SortableItemCardProps {
  item: Item;
  actions: Action[];
  onToggleDone?: () => void;
  onSave: (updated: Item) => void;
  accentColor?: string;
  checkboxVariant?: 'circle' | 'square';
  subtasks?: Item[];
  onAddSubtask?: (title: string) => void;
  onToggleSubtask?: (subtask: Item) => void;
  onDeleteSubtask?: (subtask: Item) => void;
  onReorderSubtasks?: (activeId: string, overId: string) => void;
}

export default function SortableItemCard(props: SortableItemCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: props.item.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
    >
      <ItemCard {...props} dragHandleListeners={listeners} dragHandleAttributes={attributes} />
    </div>
  );
}
