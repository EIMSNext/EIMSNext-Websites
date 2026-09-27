export interface RegisterRequest {
  type: "phone" | "email";
  phone?: string;
  email?: string;
  code: string;
  password: string;
}
