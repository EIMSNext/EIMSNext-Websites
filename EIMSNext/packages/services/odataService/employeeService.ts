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

    reviewJoinCorporate(data: ReviewJoinCorporateRequest): Promise<{ success: boolean }> {
        return this.http().api.post<{ success: boolean }>("/employee/reviewjoincorporate", data);
    }

    acceptInvite(data: EmployeeInviteDecisionRequest): Promise<{ success: boolean }> {
        return this.http().api.post<{ success: boolean }>("/employee/acceptinvite", data);
    }
}

const employeeService = new EmployeeService()
export { employeeService }

