export interface FindManyOptions<T> {
  page?: number;
  limit?: number;
  search?: string;
  searchField?: string | string[];
  sortBy?: keyof T;
  sortOrder?: "asc" | "desc";
  filters?: any;
  include?: any;
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
  const { page = 1, limit = 10, search, searchField, sortBy, sortOrder, filters = {}, include } = options;

  const where: any = { ...filters };

  if (search && searchField) {
    if (Array.isArray(searchField)) {
      // 👇 Build OR condition for multiple fields
      where.OR = searchField.map((field) => {
        const keys = (field as string).split(".");

        // Build nested structure dynamically
        let condition: any = {};
        let current = condition;

        keys.forEach((key, index) => {
          if (index === keys.length - 1) {
            current[key] = { contains: search, mode: "insensitive" };
          } else {
            current[key] = {};
            current = current[key];
          }
        });

        return condition;
      });
    } else {
      // 👇 Single field search
      where[searchField as string] = { contains: search, mode: "insensitive" };
    }
  }

  const orderBy = sortBy && sortOrder ? { [sortBy as string]: sortOrder } : { createdAt: "desc" };

  const total = await model.count({ where } as any);
  const data = await model.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
    include,
  } as any);

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
