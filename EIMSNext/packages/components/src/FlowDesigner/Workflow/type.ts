import { ISelectedTag } from "@/selectedTags/type";
import { CandidateType, IApprovalCandidate } from "../Common/FlowData";
import { DataItemType } from "@/common";

export function convertTagToCandidate(tag: ISelectedTag): IApprovalCandidate {
  return {
    candidateId: tag.id,
    candidateType: convertItemTypeToCandidateType(tag.type),
    candidateName: tag.label,
    cascadedDept: tag.cascadedDept ?? false,
  };
}
export function convertCandidateToTag(
  candidate: IApprovalCandidate
): ISelectedTag {
  return {
    id: candidate.candidateId,
    label: candidate.candidateName,
    type: convertCandidateTypeToItemType(candidate.candidateType),
    cascadedDept: candidate.cascadedDept,
  };
}
export function convertItemTypeToCandidateType(tagType: DataItemType): CandidateType {
  let candidateType = CandidateType.Unknown;
  switch (tagType) {
    case DataItemType.Department:
      candidateType = CandidateType.Department;
      break;
    case DataItemType.Role:
      candidateType = CandidateType.Role;
      break;
    case DataItemType.Employee:
      candidateType = CandidateType.Employee;
      break;
    case DataItemType.Dynamic:
      candidateType = CandidateType.Dynamic;
      break;
  }
  return candidateType;
}
export function convertCandidateTypeToItemType(
  candidateType: CandidateType
): DataItemType {
  let tagType = DataItemType.Unknown;
  switch (candidateType) {
    case CandidateType.Department:
      tagType = DataItemType.Department;
      break;
    case CandidateType.Role:
      tagType = DataItemType.Role;
      break;
    case CandidateType.Employee:
      tagType = DataItemType.Employee;
      break;
    case CandidateType.Dynamic:
      tagType = DataItemType.Dynamic;
      break;
  }
  return tagType;
}
