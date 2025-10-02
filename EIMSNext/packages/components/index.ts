import { makeInstaller } from "./src/utils/install";
import components from "./src/index";

export * from "./src/component";
export * from "./src/common";

export default makeInstaller([...components]);
