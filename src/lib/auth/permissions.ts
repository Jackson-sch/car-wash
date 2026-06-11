// lib/auth/permissions.ts
export const PERMISSIONS = {
  clientes: {
    ver:      ['admin', 'supervisor', 'cajero'],
    crear:    ['admin', 'supervisor', 'cajero'],
    editar:   ['admin', 'supervisor', 'cajero'],
    eliminar: ['admin'],
  },
  ordenes: {
    ver:           ['admin', 'supervisor', 'cajero', 'lavador'],
    crear:         ['admin', 'supervisor', 'cajero'],
    asignar:       ['admin', 'supervisor'],
    cambiarEstado: ['admin', 'supervisor', 'cajero', 'lavador'],
    cancelar:      ['admin', 'supervisor'],
  },
  servicios: {
    ver:       ['admin', 'supervisor', 'cajero'],
    gestionar: ['admin', 'supervisor'],
  },
  caja: {
    abrir:  ['admin', 'supervisor', 'cajero'],
    cerrar: ['admin', 'supervisor', 'cajero'],
    ver:    ['admin', 'supervisor'],
  },
  inventario: {
    ver:       ['admin', 'supervisor'],
    gestionar: ['admin', 'supervisor'],
  },
  reportes: {
    ver:      ['admin', 'supervisor'],
    exportar: ['admin', 'supervisor'],
  },
  empleados: {
    ver:       ['admin', 'supervisor'],
    gestionar: ['admin'],
  },
  paquetes: {
    ver:       ['admin', 'supervisor', 'cajero'],
    gestionar: ['admin', 'supervisor'],
  },
  configuracion: {
    ver:       ['admin'],
    gestionar: ['admin'],
  },
} as const;

// Helper to check if a role is authorized to perform an action on a module
export function canDo(
  rol: string,
  modulo: keyof typeof PERMISSIONS,
  accion: string
): boolean {
  const allowed = PERMISSIONS[modulo]?.[accion as never] as string[] | undefined;
  return allowed?.includes(rol) ?? false;
}
