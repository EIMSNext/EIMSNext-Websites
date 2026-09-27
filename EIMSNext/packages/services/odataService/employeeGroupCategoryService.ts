import { ODataServiceBase } from "../interface";
import { EmployeeGroupCategory, EmployeeGroupCategoryRequest } from "@eimsnext/models";

export class EmployeeGroupCategoryService extends ODataServiceBase<EmployeeGroupCategory, EmployeeGroupCategoryRequest> {
    protected modelName(): string {
        return "EmployeeGroupCategory";
    }
}

const employeeGroupCategoryService = new EmployeeGroupCategoryService()
export { employeeGroupCategoryService }

