export interface ApiResponse<T> {
  message: string;
  data: T;
  validation?: {
    field: string;
    message: string;
  }[];
  success?: boolean;
}

export type StringMap = { [k in string]: string };

export type FormDataMap = { [k in string]: string | number };

export type Mode = "busStops" | "routes";

export type RouteForm = { id?: number; name: string };
