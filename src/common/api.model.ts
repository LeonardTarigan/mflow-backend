export class ResponseMeta {
  currentPage: number;
  previousPage: number | null;
  nextPage: number | null;
  totalPage: number;
  totalData: number;
}

export class ApiResponse<T> {
  data?: T;
  error?: string;
  meta?: ResponseMeta;
}
