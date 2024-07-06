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
