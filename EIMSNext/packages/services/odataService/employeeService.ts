import { ODataServiceBase } from "../interface";
import { Employee, EmployeeRequest } from "@eimsnext/models";

export interface ReviewJoinCorporateRequest {
  employeeIds: string[];
  approved: boolean;
}

export interface EmployeeInviteDecisionRequest {
  accepted: boolean;
}

export class EmployeeService extends ODataServiceBase<Employee, EmployeeRequest> {
    protected modelName(): string {
        return "Employee";
    }

    queryByDepartment<T>(departmentId: string, cascadedDept: boolean = false, query?: string): Promise<T[]> {
        return this.http().odata.query<T>(this.departmentModelName(departmentId, cascadedDept), query);
    }

    countByDepartment(departmentId: string, cascadedDept: boolean = false, query?: string): Promise<number> {
        return this.http().odata.count(this.departmentModelName(departmentId, cascadedDept), query);
    }

    reviewJoinCorporate(data: ReviewJoinCorporateRequest): Promise<{ success: boolean }> {
        return this.http().api.post<{ success: boolean }>("/employee/reviewjoincorporate", data);
    }

    acceptInvite(data: EmployeeInviteDecisionRequest): Promise<{ success: boolean }> {
        return this.http().api.post<{ success: boolean }>("/employee/acceptinvite", data);
    }

    private departmentModelName(departmentId: string, cascadedDept: boolean) {
        const query = new URLSearchParams({
            departmentId,
            cascadedDept: `${cascadedDept}`,
        });
        return `${this.modelName()}?${query.toString()}`;
    }
}

const employeeService = new EmployeeService()
export { employeeService }

