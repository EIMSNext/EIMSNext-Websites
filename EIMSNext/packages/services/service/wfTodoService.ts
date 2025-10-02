import { ReadonlyODataServiceBase } from "../interface";
import { WfTodo } from "@eimsnext/models";

export class WfTodoService extends ReadonlyODataServiceBase<WfTodo> {
  protected modelName(): string {
    return "WfTodo";
  }
}

const wfTodoService = new WfTodoService();
export { wfTodoService };
