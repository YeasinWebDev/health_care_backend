
export interface FindManyOptions<T> {
  page?: number;
  limit?: number;
  search?: string;
  searchField?: keyof T;
  sortBy?: keyof T;
  sortOrder?: "asc" | "desc";
  filters?: any;
}

export interface PaginatedResult<T> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  data: T[];
}

export async function findManyWithFilters<T, FindManyArgs extends { where?: any; skip?: number; take?: number; orderBy?: any }, CountArgs extends { where?: any }>(
  model: {
    findMany: (args: FindManyArgs) => Promise<T[]>;
    count: (args: CountArgs) => Promise<number>;
  },
  options: FindManyOptions<T>
): Promise<PaginatedResult<T>> {
  const { page = 1, limit = 10, search, searchField, sortBy, sortOrder, filters = {} } = options;

  const where: any = { ...filters };

  if (search && searchField) {
    where[searchField as string] = { contains: search, mode: "insensitive" };
  }

  const orderBy = sortBy && sortOrder ? { [sortBy as string]: sortOrder } : { createdAt: "desc" };

  const total = await model.count({ where } as any);
  const data = await model.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit } as any);

  return {
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
    data,
  };
}
