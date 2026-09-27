import eventFlowDiagram from "./EventFlow/EventFlowDiagram.vue";
import eventFlowMetaEditor from "./EventFlow/EventFlowMetaEditor.vue";
import httpSampleDialog from "./EventFlow/HttpSampleDialog.vue";
import workflowDiagram from "./Workflow/WorkflowDiagram.vue";
import workflowMetaEditor from "./Workflow/WorkflowMetaEditor.vue";
import { withInstall } from "../utils/install";
export * from "./EventFlow/formula";
export * from "./EventFlow/fieldMappingRules";

const EventFlowDiagram = withInstall(eventFlowDiagram);
const EventFlowMetaEditor = withInstall(eventFlowMetaEditor);
const HttpSampleDialog = withInstall(httpSampleDialog);
const WorkflowDiagram = withInstall(workflowDiagram);
const WorkflowMetaEditor = withInstall(workflowMetaEditor);

export { EventFlowDiagram, EventFlowMetaEditor, HttpSampleDialog, WorkflowDiagram, WorkflowMetaEditor };
