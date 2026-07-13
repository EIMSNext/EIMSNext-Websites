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
        const deptFilter = cascadedDept
            ? `EmpDepts/any(d: contains(d/HeriarchyId, '|${departmentId}|'))`
            : `EmpDepts/any(d: d/Id eq '${departmentId}')`;

        const { body, urlParams } = this.buildDeptQuery(deptFilter, query);
        const url = urlParams ? `${this.modelName()}?${urlParams}` : this.modelName();
        return this.http().odata.query<T>(url, body);
    }

    countByDepartment(departmentId: string, cascadedDept: boolean = false, query?: string): Promise<number> {
        const deptFilter = cascadedDept
            ? `EmpDepts/any(d: contains(d/HeriarchyId, '|${departmentId}|'))`
            : `EmpDepts/any(d: d/Id eq '${departmentId}')`;

        const { body, urlParams } = this.buildDeptQuery(deptFilter, query);
        const url = urlParams ? `${this.modelName()}?${urlParams}` : this.modelName();
        return this.http().odata.count(url, body);
    }

    reviewJoinCorporate(data: ReviewJoinCorporateRequest): Promise<{ success: boolean }> {
        return this.http().api.post<{ success: boolean }>("/employee/reviewjoincorporate", data);
    }

    acceptInvite(data: EmployeeInviteDecisionRequest): Promise<{ success: boolean }> {
        return this.http().api.post<{ success: boolean }>("/employee/acceptinvite", data);
    }

    private buildDeptQuery(deptFilter: string, query?: string): { body: string; urlParams: string } {
        const urlParams = new URLSearchParams();
        const bodyParams = new URLSearchParams();

        if (query) {
            const params = new URLSearchParams(query);
            for (const [key, value] of params.entries()) {
                if (key === "adminScope") {
                    urlParams.set(key, value);
                } else {
                    bodyParams.set(key, value);
                }
            }
        }

        const existingFilter = bodyParams.get("$filter");
        const combinedFilter = existingFilter
            ? `(${existingFilter}) and (${deptFilter})`
            : deptFilter;
        bodyParams.set("$filter", combinedFilter);

        return {
            body: bodyParams.toString(),
            urlParams: urlParams.toString(),
        };
    }
}

const employeeService = new EmployeeService()
export { employeeService }
