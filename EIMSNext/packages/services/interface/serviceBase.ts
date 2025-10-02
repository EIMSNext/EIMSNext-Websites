import { http, HttpClient } from "@eimsnext/utils";

export abstract class ServiceBase {
  protected http(): HttpClient {
    return http;
  }
}
