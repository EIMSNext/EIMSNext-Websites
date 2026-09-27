export interface SendRegCodeRequest {
  type: "phone" | "email";
  target: string;
}
