export class ResponseMeta {
  current_page: number;
  previous_page: number | null;
  next_page: number | null;
  total_page: number;
  total_data: number;
}

export class ApiResponse<T> {
  data?: T;
  error?: string | string[];
  meta?: ResponseMeta;
}
