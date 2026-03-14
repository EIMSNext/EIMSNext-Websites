import { ODataServiceBase } from "../interface";
import { Department, DepartmentRequest } from "@eimsnext/models";

export class DepartmentService extends ODataServiceBase<Department, DepartmentRequest> {
    protected modelName(): string {
        return "Department";
    }
}

const departmentService = new DepartmentService()
export { departmentService }

