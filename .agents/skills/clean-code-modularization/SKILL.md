---
name: clean-code-modularization
description: Enforces clean code architecture by separating large monolithic pages/components into modular sub-components, custom hooks, and separate type files. Use this skill when writing, refactoring, or reviewing frontend code to prevent spaghetti files and maintain sustainability.
license: MIT
metadata:
  author: Antigravity
  version: "1.0.0"
  date: June 2026
  abstract: A guidelines framework to ensure code cleanlines and prevent code bloat by enforcing modularization. Enforces extracting page states to custom hooks, breaking large JSX blocks into dedicated local components, organizing files into component trees, and documenting proper code splitting boundaries.
---

# Clean Code & Component Modularization Guidelines

These guidelines establish a clean code standard for the **WashMaster Pro** application to prevent the accumulation of "spaghetti code" and monolithic files. By splitting views into small, reusable, and single-responsibility components, we ensure that the codebase remains readable, testable, and maintainable.

---

## When to Apply

Apply these guidelines when:
- Creating a new page or module view.
- Enhancing features on an existing client component.
- Reviewing code where a single `.tsx` or `.ts` file exceeds **300 lines** of code.
- Noticing complex form logic, multiple modal dialogs, or nested list renderers inside a single view.
- Refactoring complex state logic that clutters the UI rendering hierarchy.

---

## 1. Modularization Thresholds (The Rules of Thumb)

| Metric | Trigger | Action |
| :--- | :--- | :--- |
| **File Length** | Exceeds **300-400 lines** of code. | Extract sub-components, helper utilities, or custom hooks. |
| **JSX Nesting** | Render tree has more than **3 levels of nested sections** (excluding basic wrapper divs). | Split branches into separate functional components. |
| **Modal / Dialog Count** | More than **1 modal dialog** defined inside the same file. | Extract each dialog into its own file (e.g., `ClienteModal.tsx`, `ArqueoCajaDialog.tsx`). |
| **Forms & Validation** | Form state uses **more than 6 state variables** or has complex validations. | Extract form state and handling into a custom hook or React Hook Form hook. |
| **Lists & Card Items** | Map loops containing inline JSX with **more than 15 lines of content**. | Extract the item renderer into a dedicated list item component. |

---

## 2. Recommended Directory Architecture

Organize components based on their scope and reusability:

```text
src/
├── app/
│   └── (dashboard)/
│       └── ordenes/
│           ├── page.tsx               # Server-side data fetching / Page shell
│           ├── ordenes-client.tsx     # Client orchestrator (filters, tab states)
│           └── components/            # View-specific sub-components
│               ├── OrdenesTable.tsx   # Extracted Table layout
│               ├── OrdenRow.tsx       # Single row renderer
│               └── AsignarLavador.tsx # Asignment dialog/popover
├── components/
│   ├── ui/                            # Shared primitive UI components (Shadcn UI)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── dialog.tsx
│   └── layout/                        # Global structural elements
│       ├── header.tsx
│       └── sidebar.tsx
├── hooks/                             # Shared hooks
│   └── useDebounce.ts
└── types/                             # Shared type definitions
    └── index.ts
```

---

## 3. How to Modularize

### A. Extracting Page State (The Orchestrator Pattern)
Keep the main page/client file as an orchestrator. It should only load data, manage high-level states (like active filters or selected items), and pass props to specialized sub-components.

*❌ Incorrect (Monolithic Spaghetti):*
```tsx
// src/app/servicios/servicios-client.tsx
export function ServiciosClient() {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", price: "" });

  // 150 lines of handlers and form validation logic...

  return (
    <div>
      {/* 200 lines of UI: header, search, grid, cards, footer, plus inline modal code */}
    </div>
  );
}
```

*✅ Correct (Modularized):*
```tsx
// src/app/servicios/servicios-client.tsx
import { ServiciosGrid } from "./components/ServiciosGrid";
import { ServicioModal } from "./components/ServicioModal";
import { useServicioForm } from "./hooks/useServicioForm";

export function ServiciosClient({ initialItems }) {
  const { 
    items, 
    isModalOpen, 
    editingItem, 
    openCreate, 
    openEdit, 
    closeModal, 
    saveItem 
  } = useServicioForm(initialItems);

  return (
    <div className="space-y-6">
      <ServicioHeader onAdd={openCreate} />
      <ServiciosGrid items={items} onEdit={openEdit} />
      <ServicioModal 
        isOpen={isModalOpen} 
        item={editingItem} 
        onClose={closeModal} 
        onSave={saveItem} 
      />
    </div>
  );
}
```

### B. Extracting Complex Dialogs and Modals
Each modal dialog has its own layout, validation, and submission states. Move it to a separate file, accepting visibility props (`isOpen`, `onClose`) and callback actions (`onSuccess`).

*✅ Modal Separation Structure:*
```tsx
// src/app/servicios/components/ServicioModal.tsx
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

interface ServicioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  initialData?: any;
}

export function ServicioModal({ isOpen, onClose, onSave, initialData }: ServicioModalProps) {
  // Keeps form-specific states and validation local to the modal
  const [nombre, setNombre] = useState(initialData?.nombre || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({ nombre });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {/* Form layout */}
      </DialogContent>
    </Dialog>
  );
}
```

### C. Extracting Tables and Complex List Rows
Avoid rendering huge tables with inline maps. Instead, extract the table component, and if rows have interactive logic (menus, status updates), extract the row component.

*✅ Table Row Separation Structure:*
```tsx
// src/app/ordenes/components/OrdenRow.tsx
interface OrdenRowProps {
  orden: any;
  onStatusChange: (id: string, newStatus: string) => void;
}

export function OrdenRow({ orden, onStatusChange }: OrdenRowProps) {
  return (
    <tr className="hover:bg-zinc-50 transition-colors">
      <td className="py-3.5 pl-3 font-bold">{orden.nroTicket}</td>
      <td className="py-3.5">{orden.placa}</td>
      <td className="py-3.5">
        <select 
          value={orden.estado} 
          onChange={(e) => onStatusChange(orden.id, e.target.value)}
          className="rounded border p-1"
        >
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En Proceso</option>
        </select>
      </td>
    </tr>
  );
}
```

---

## 4. Coding Practices Checklist

1. **Explicit TypeScript Interfaces**: Document props for every extracted component (never use `any`).
2. **Local State Colocation**: Keep state as close to where it is used as possible. If a form is only visible inside a modal, its input state variables belong inside that modal component, not in the parent page.
3. **No Inline Styling**: Keep typography, margins, and layout in standard tailwind classes, styled consistently.
4. **Custom Hooks for Logic**: Extract asynchronous database calls, toasts, and transitions to custom hooks if they occur alongside form validations.
5. **Revalidate Strategy**: Call Next.js Server Actions and use client state synchronization cleanly without mixing state side-effects.
