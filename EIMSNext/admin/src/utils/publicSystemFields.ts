import { FieldDef } from "@eimsnext/models";

const publicSystemFields = ["wxopenid", "wxnickname", "wxavator", "ext"];

export function isPublicSystemField(field?: string) {
  return !!field && publicSystemFields.includes(field.toLowerCase());
}

export function isPublicSystemFieldDef(field?: Pick<FieldDef, "field" | "source" | "systemKind">) {
  if (!field) return false;
  const name = `${field.field || field.systemKind || ""}`.toLowerCase();
  const source = `${field.source || ""}`.toLowerCase();
  return publicSystemFields.includes(name) && (source === "public" || isPublicSystemField(field.systemKind));
}
