import { TagType } from "@eimsnext/components";
import { MemberType } from "@eimsnext/models";

export const convertMemberTypeToTagType = (mType: MemberType): TagType => {
    switch (mType) {
        case MemberType.Department:
            return TagType.Department;
        case MemberType.Employee:
            return TagType.Employee;
        case MemberType.Role:
            return TagType.Role;
        default:
            return TagType.None;
    }
}
export const convertTagTypeToMemberType = (tType: TagType): MemberType => {
    switch (tType) {
        case TagType.Department:
            return MemberType.Department;
        case TagType.Employee:
            return MemberType.Employee;
        case TagType.Role:
            return MemberType.Role;
        default:
            return MemberType.None;
    }
}