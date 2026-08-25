import { ODataServiceBase } from "../interface";

export interface SerialNoSequence {
  id: string;
  appId: string;
  formId: string;
  key: string;
  currId?: number;
  currDate?: string;
  serialNoType?: number;
}

export class SerialNoSequenceService extends ODataServiceBase<SerialNoSequence> {
  protected modelName(): string {
    return "SerialNoSequence";
  }

  queryByScope(appId: string, formId: string, key: string): Promise<SerialNoSequence[]> {
    const filter = [
      // SerialNoType.Form is the second enum value; Corporate is 1.
      "serialNoType eq 2",
      `appId eq '${escapeODataValue(appId)}'`,
      `formId eq '${escapeODataValue(formId)}'`,
      `key eq '${escapeODataValue(key)}'`,
    ].join(" and ");
    const query = new URLSearchParams({ $filter: filter, $top: "1" }).toString();
    return this.query<SerialNoSequence>(query);
  }

  reset(id: string): Promise<SerialNoSequence> {
    return this.patch<SerialNoSequence>(id, { id, currId: 0 });
  }
}

const serialNoSequenceService = new SerialNoSequenceService();
export { serialNoSequenceService };

function escapeODataValue(value: string): string {
  return String(value || "").replace(/'/g, "''");
}
