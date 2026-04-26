declare module "@univerjs/core/facade" {
  export const FUniver: any;
}

declare module "@univerjs/engine-formula/facade";
declare module "@univerjs/ui/facade";
declare module "@univerjs/docs-ui/facade";
declare module "@univerjs/sheets/facade" {
  export const FWorkbook: any;
  export const FRange: any;
}

declare module "@univerjs/sheets-ui/facade";
declare module "@univerjs/sheets-formula/facade";
declare module "@univerjs/sheets-numfmt/facade";

declare module "@univerjs/design/locale/zh-CN" {
  const locale: Record<string, unknown>;
  export default locale;
}

declare module "@univerjs/ui/locale/zh-CN" {
  const locale: Record<string, unknown>;
  export default locale;
}

declare module "@univerjs/drawing-ui/locale/zh-CN" {
  const locale: Record<string, unknown>;
  export default locale;
}

declare module "@univerjs/docs-ui/locale/zh-CN" {
  const locale: Record<string, unknown>;
  export default locale;
}

declare module "@univerjs/sheets/locale/zh-CN" {
  const locale: Record<string, unknown>;
  export default locale;
}

declare module "@univerjs/sheets-drawing-ui/locale/zh-CN" {
  const locale: Record<string, unknown>;
  export default locale;
}

declare module "@univerjs/sheets-ui/locale/zh-CN" {
  const locale: Record<string, unknown>;
  export default locale;
}

declare module "@univerjs/sheets-formula-ui/locale/zh-CN" {
  const locale: Record<string, unknown>;
  export default locale;
}

declare module "@univerjs/sheets-numfmt-ui/locale/zh-CN" {
  const locale: Record<string, unknown>;
  export default locale;
}
