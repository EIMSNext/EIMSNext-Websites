import dataflowDiagram from "./Dataflow/DataflowDiagram.vue";
import dataflowMetaEditor from "./Dataflow/DataflowMetaEditor.vue";
import workflowDiagram from "./Workflow/WorkflowDiagram.vue";
import workflowMetaEditor from "./Workflow/WorkflowMetaEditor.vue";
import { withInstall } from "../utils/install";

const DataflowDiagram = withInstall(dataflowDiagram);
const DataflowMetaEditor = withInstall(dataflowMetaEditor);
const WorkflowDiagram = withInstall(workflowDiagram);
const WorkflowMetaEditor = withInstall(workflowMetaEditor);

export { DataflowDiagram, DataflowMetaEditor,WorkflowDiagram,WorkflowMetaEditor };
