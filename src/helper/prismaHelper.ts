import { PrismaClient, Prisma } from "@prisma/client";

export interface FindManyOptions<T> {
  page?: number;
  limit?: number;
  search?: string;
  searchField?: keyof T;
  sortBy?: keyof T;
  sortOrder?: "asc" | "desc";
  filters?: Partial<T>;
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

export async function findManyWithFilters<T extends {}>(
  model: {
    findMany: (args: Prisma.UserFindManyArgs) => Promise<T[]>;
    count: (args: Prisma.UserCountArgs) => Promise<number>;
  },
  options: FindManyOptions<T>
): Promise<PaginatedResult<T>> {
  const {
    page = 1,
    limit = 10,
    search,
    searchField,
    sortBy,
    sortOrder,
    filters = {},
  } = options;

  const where: any = { ...filters };

  if (search && searchField) {
    where[searchField] = { contains: search, mode: "insensitive" };
  }

  // Sorting
  const orderBy: Prisma.UserOrderByWithRelationInput =
    sortBy && sortOrder
      ? { [sortBy]: sortOrder as Prisma.SortOrder }
      : { createdAt: "desc" };

  // Total count for pagination
  const total = await model.count({ where });

  // Data fetch with pagination
  const data = await model.findMany({
    skip: (page - 1) * limit,
    take: limit,
    where,
    orderBy,
  });

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
