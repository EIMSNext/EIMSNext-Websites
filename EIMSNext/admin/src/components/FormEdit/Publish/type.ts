import { DataItemType } from "@eimsnext/components";
import { MemberType } from "@eimsnext/models";

export const convertMemberTypeToTagType = (mType: MemberType): DataItemType => {
    switch (mType) {
        case MemberType.Department:
            return DataItemType.Department;
        case MemberType.Employee:
            return DataItemType.Employee;
        case MemberType.Role:
            return DataItemType.Role;
        default:
            return DataItemType.Unknown;
    }
}
export const convertTagTypeToMemberType = (tType: DataItemType): MemberType => {
    switch (tType) {
        case DataItemType.Department:
            return MemberType.Department;
        case DataItemType.Employee:
            return MemberType.Employee;
        case DataItemType.Role:
            return MemberType.Role;
        default:
            return MemberType.None;
    }
}