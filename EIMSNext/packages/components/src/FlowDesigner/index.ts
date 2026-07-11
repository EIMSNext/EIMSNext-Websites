import dataflowDiagram from "./Dataflow/DataflowDiagram.vue";
import dataflowMetaEditor from "./Dataflow/DataflowMetaEditor.vue";
import httpSampleDialog from "./Dataflow/HttpSampleDialog.vue";
import workflowDiagram from "./Workflow/WorkflowDiagram.vue";
import workflowMetaEditor from "./Workflow/WorkflowMetaEditor.vue";
import { withInstall } from "../utils/install";
export * from "./Dataflow/formula";
export * from "./Dataflow/fieldMappingRules";

const DataflowDiagram = withInstall(dataflowDiagram);
const DataflowMetaEditor = withInstall(dataflowMetaEditor);
const HttpSampleDialog = withInstall(httpSampleDialog);
const WorkflowDiagram = withInstall(workflowDiagram);
const WorkflowMetaEditor = withInstall(workflowMetaEditor);

export { DataflowDiagram, DataflowMetaEditor, HttpSampleDialog, WorkflowDiagram, WorkflowMetaEditor };
