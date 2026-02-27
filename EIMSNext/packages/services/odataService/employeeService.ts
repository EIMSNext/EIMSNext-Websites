import { ODataServiceBase } from "../interface";
import { Employee, EmployeeRequest } from "@eimsnext/models";

export class EmployeeService extends ODataServiceBase<Employee, EmployeeRequest> {
    protected modelName(): string {
        return "Employee";
    }
}

const employeeService = new EmployeeService()
export { employeeService }

