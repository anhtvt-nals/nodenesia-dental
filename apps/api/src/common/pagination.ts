export interface PaginationQuery {
  page?: string | number;
  pageSize?: string | number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function parsePagination(
  query: PaginationQuery = {},
  defaultPageSize = 20,
  maxPageSize = 500,
): { page: number; pageSize: number; skip: number } {
  const rawPage = Number(query.page);
  const rawSize = Number(query.pageSize);
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
  const pageSize =
    Number.isFinite(rawSize) && rawSize >= 1
      ? Math.min(Math.floor(rawSize), maxPageSize)
      : defaultPageSize;
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export async function paginateArray<T>(
  source: Promise<T[]> | T[],
  query: PaginationQuery = {},
  defaultPageSize = 20,
  maxPageSize = 500,
): Promise<PaginatedResult<T>> {
  const allItems = await source;
  const { page, pageSize, skip } = parsePagination(query, defaultPageSize, maxPageSize);
  return {
    items: allItems.slice(skip, skip + pageSize),
    total: allItems.length,
    page,
    pageSize,
  };
}
