import { ODataServiceBase } from "../interface";
import { Employee, EmployeeRequest } from "@eimsnext/models";
import { BatchDeleteRequest, ODataQueryRequest } from "../requestModel";

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

    get<T>(id: string, query?: ODataQueryRequest | string, options?: { silentError?: boolean }): Promise<T> {
        return this.http().odata.get<T>(this.modelName(), id, query, options);
    }

    query<T>(query?: ODataQueryRequest | string): Promise<T[]> {
        return this.http().odata.query<T>(this.modelName(), query);
    }

    post<T>(data: EmployeeRequest): Promise<T> {
        return this.http().odata.post<T>(this.modelName(), data);
    }

    put<T>(id: string, data: EmployeeRequest): Promise<T> {
        return this.http().odata.put<T>(this.modelName(), id, data);
    }

    patch<T>(id: string, data: EmployeeRequest): Promise<T> {
        return this.http().odata.patch<T>(this.modelName(), id, data);
    }

    delete<T>(id: string, data?: BatchDeleteRequest): Promise<T> {
        return this.http().odata.delete<T>(this.modelName(), id, data);
    }

    queryByDepartment<T>(departmentId: string, cascadedDept: boolean = false, query?: string): Promise<T[]> {
        // 级联过滤直接用关系表上的层级路径快照 HeriarchyId，无需经 d/Department 导航联表。
        const escapedDepartmentId = departmentId.replaceAll("'", "''");
        const deptFilter = cascadedDept
            ? `Departments/any(d: contains(d/HeriarchyId, '|${escapedDepartmentId}|'))`
            : `Departments/any(d: d/DepartmentId eq '${escapedDepartmentId}')`;

        const { body, urlParams } = this.buildDeptQuery(deptFilter, query, true);
        const url = urlParams ? `${this.modelName()}?${urlParams}` : this.modelName();
        return this.http().odata.query<T>(url, body);
    }

    countByDepartment(departmentId: string, cascadedDept: boolean = false, query?: string): Promise<number> {
        const escapedDepartmentId = departmentId.replaceAll("'", "''");
        const deptFilter = cascadedDept
            ? `Departments/any(d: contains(d/HeriarchyId, '|${escapedDepartmentId}|'))`
            : `Departments/any(d: d/DepartmentId eq '${escapedDepartmentId}')`;

        const { body, urlParams } = this.buildDeptQuery(deptFilter, query, true);
        const url = urlParams ? `${this.modelName()}?${urlParams}` : this.modelName();
        return this.http().odata.count(url, body);
    }

    reviewJoinCorporate(data: ReviewJoinCorporateRequest): Promise<{ success: boolean }> {
        return this.http().api.post<{ success: boolean }>("/employee/reviewjoincorporate", data);
    }

    acceptInvite(data: EmployeeInviteDecisionRequest): Promise<{ success: boolean }> {
        return this.http().api.post<{ success: boolean }>("/employee/acceptinvite", data);
    }

    private buildDeptQuery(deptFilter: string, query?: string, includeRelations = false): { body: string; urlParams: string } {
        const params = new URLSearchParams();
        const urlParams = new URLSearchParams();

        if (query) {
            const inputParams = new URLSearchParams(query.startsWith("?") ? query.slice(1) : query);
            for (const [key, value] of inputParams.entries()) params.set(key, value);
        }

        const existingFilter = params.get("$filter");
        const combinedFilter = existingFilter
            ? `(${existingFilter}) and (${deptFilter})`
            : deptFilter;
        params.set("$filter", combinedFilter);
        if (includeRelations) params.set("$expand", "Departments($expand=Department),Groups");

        return { body: params.toString(), urlParams: urlParams.toString() };
    }
}

const employeeService = new EmployeeService()
export { employeeService }
