import { ISelectedTag } from "@/selectedTags/type";
import { CandidateType, IApprovalCandidate } from "../Common/FlowData";
import { DataItemType } from "@/common";

function normalizeManagerLevels(levels?: number[]): number[] | undefined {
  if (!levels || levels.length === 0) {
    return undefined;
  }

  const uniqueLevels = [...new Set(levels.filter((x) => x > 0))].sort(
    (a, b) => a - b,
  );
  return uniqueLevels.length > 0 ? uniqueLevels : undefined;
}

function buildCandidateTagId(
  candidateType: CandidateType,
  candidateId: string,
  managerLevels?: number[],
): string {
  const normalizedLevels = normalizeManagerLevels(managerLevels);
  const managerKey = normalizedLevels ? `|m:${normalizedLevels.join(",")}` : "";
  return `${candidateType}:${candidateId}${managerKey}`;
}

export function convertTagToCandidate(tag: ISelectedTag): IApprovalCandidate {
  const managerLevels = normalizeManagerLevels(tag.managerLevels);
  return {
    candidateId: tag.sourceId || tag.id,
    candidateType: convertItemTypeToCandidateType(tag.type),
    candidateName: tag.label,
    cascadedDept: tag.cascadedDept ?? false,
    managerLevels,
  };
}

function getManagerLevelLabel(level: number): string {
  if (level === 1) {
    return "workflow.directManager";
  }
  if (level === 2) {
    return "workflow.higherLevelManager";
  }
  return `workflow.nthLevelManager|${level}`;
}

export function convertCandidateToTag(
  candidate: IApprovalCandidate
): ISelectedTag {
  const managerLevels = normalizeManagerLevels(candidate.managerLevels);
  return {
    id: buildCandidateTagId(
      candidate.candidateType,
      candidate.candidateId,
      managerLevels,
    ),
    label: candidate.candidateName,
    type: convertCandidateTypeToItemType(candidate.candidateType),
    sourceId: candidate.candidateId,
    managerLevels,
    cascadedDept: candidate.cascadedDept,
  };
}

export function convertCandidateToTags(
  candidate: IApprovalCandidate,
): ISelectedTag[] {
  const baseTag = convertCandidateToTag(candidate);
  const managerLevels = normalizeManagerLevels(candidate.managerLevels);
  if (!managerLevels) {
    return [baseTag];
  }

  const baseLabel = candidate.candidateName.split(" | ")[0];
  return managerLevels.map((level) => ({
    ...baseTag,
    id: buildCandidateTagId(candidate.candidateType, candidate.candidateId, [level]),
    label: `${baseLabel} | ${getManagerLevelLabel(level)}`,
    managerLevels: [level],
    data: {
      ...(baseTag.data || {}),
      baseLabel,
    },
  }));
}

export function convertTagsToCandidates(tags: ISelectedTag[]): IApprovalCandidate[] {
  const candidates: IApprovalCandidate[] = [];
  const managerCandidateMap = new Map<string, IApprovalCandidate>();

  tags.forEach((tag) => {
    const managerLevels = normalizeManagerLevels(tag.managerLevels);
    if (!managerLevels) {
      candidates.push(convertTagToCandidate(tag));
      return;
    }

    const key = `${tag.type}:${tag.sourceId || tag.id}`;
    const existing = managerCandidateMap.get(key);
    if (existing) {
      existing.managerLevels = normalizeManagerLevels([
        ...(existing.managerLevels || []),
        ...managerLevels,
      ]);
      return;
    }

    const candidate = convertTagToCandidate({
      ...tag,
      label: tag.data?.baseLabel || tag.label.split(" | ")[0],
      managerLevels,
    });
    managerCandidateMap.set(key, candidate);
  });

  return [...candidates, ...managerCandidateMap.values()];
}
export function convertItemTypeToCandidateType(tagType: DataItemType): CandidateType {
  let candidateType = CandidateType.Unknown;
  switch (tagType) {
    case DataItemType.Department:
      candidateType = CandidateType.Department;
      break;
    case DataItemType.EmployeeGroup:
      candidateType = CandidateType.EmployeeGroup;
      break;
    case DataItemType.Employee:
      candidateType = CandidateType.Employee;
      break;
    case DataItemType.Dynamic:
      candidateType = CandidateType.Dynamic;
      break;
    case DataItemType.Field:
      candidateType = CandidateType.FormField;
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
    case CandidateType.EmployeeGroup:
      tagType = DataItemType.EmployeeGroup;
      break;
    case CandidateType.Employee:
      tagType = DataItemType.Employee;
      break;
    case CandidateType.Dynamic:
      tagType = DataItemType.Dynamic;
      break;
    case CandidateType.FormField:
      tagType = DataItemType.Field;
      break;
  }
  return tagType;
}
