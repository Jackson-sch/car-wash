import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  activePage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showInfo?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}

function renderPaginationItems(
  activePage: number,
  totalPages: number,
  onPageChange: (page: number) => void
) {
  const items: React.ReactElement[] = [];

  items.push(
    <PaginationItem key={1}>
      <PaginationLink
        isActive={activePage === 1}
        onClick={() => onPageChange(1)}
        className="cursor-pointer"
      >
        1
      </PaginationLink>
    </PaginationItem>
  );

  if (activePage > 3) {
    items.push(<PaginationItem key="ellipsis-start"><PaginationEllipsis /></PaginationItem>);
  }

  for (let i = Math.max(2, activePage - 1); i <= Math.min(totalPages - 1, activePage + 1); i++) {
    items.push(
      <PaginationItem key={i}>
        <PaginationLink
          isActive={activePage === i}
          onClick={() => onPageChange(i)}
          className="cursor-pointer"
        >
          {i}
        </PaginationLink>
      </PaginationItem>
    );
  }

  if (activePage < totalPages - 2) {
    items.push(<PaginationItem key="ellipsis-end"><PaginationEllipsis /></PaginationItem>);
  }

  if (totalPages > 1) {
    items.push(
      <PaginationItem key={totalPages}>
        <PaginationLink
          isActive={activePage === totalPages}
          onClick={() => onPageChange(totalPages)}
          className="cursor-pointer"
        >
          {totalPages}
        </PaginationLink>
      </PaginationItem>
    );
  }

  return items;
}

export function PaginationControls({
  activePage,
  totalPages,
  onPageChange,
  showInfo,
  totalItems,
  itemsPerPage,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
      {showInfo && totalItems !== undefined && itemsPerPage && (
        <span className="text-xs text-zinc-500 font-medium">
          Mostrando {(activePage - 1) * itemsPerPage + 1}–
          {Math.min(activePage * itemsPerPage, totalItems)} de {totalItems} registros
        </span>
      )}
      <Pagination className={showInfo ? "mt-0" : "mt-4"}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              text="Anterior"
              onClick={() => onPageChange(Math.max(1, activePage - 1))}
              className={activePage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          {renderPaginationItems(activePage, totalPages, onPageChange)}
          <PaginationItem>
            <PaginationNext
              text="Siguiente"
              onClick={() => onPageChange(Math.min(totalPages, activePage + 1))}
              className={activePage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
