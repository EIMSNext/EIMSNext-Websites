import { ISelectedTag, TagType } from "@eimsnext/components";
import { CandidateType, IApprovalCandidate } from "../FlowData";

export function convertTagToCandidate(tag: ISelectedTag): IApprovalCandidate {
  return {
    candidateId: tag.id,
    candidateType: convertTagTypeToCandidateType(tag.type),
    candidateName: tag.label,
  };
}
export function convertCandidateToTag(candidate: IApprovalCandidate): ISelectedTag {
  return {
    id: candidate.candidateId,
    label: candidate.candidateName,
    type: convertCandidateTypeToTagType(candidate.candidateType),
  };
}
export function convertTagTypeToCandidateType(tagType: TagType): CandidateType {
  let candidateType = CandidateType.None;
  switch (tagType) {
    case TagType.Department:
      candidateType = CandidateType.Department;
      break;
    case TagType.Role:
      candidateType = CandidateType.Role;
      break;
    case TagType.Employee:
      candidateType = CandidateType.Employee;
      break;
    case TagType.Dynamic:
      candidateType = CandidateType.Dynamic;
      break;
  }
  return candidateType;
}
export function convertCandidateTypeToTagType(candidateType: CandidateType): TagType {
  let tagType = TagType.None;
  switch (candidateType) {
    case CandidateType.Department:
      tagType = TagType.Department;
      break;
    case CandidateType.Role:
      tagType = TagType.Role;
      break;
    case CandidateType.Employee:
      tagType = TagType.Employee;
      break;
    case CandidateType.Dynamic:
      tagType = TagType.Dynamic;
      break;
  }
  return tagType;
}
