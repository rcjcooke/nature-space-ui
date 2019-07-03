import paper from 'paper';
import areaTool from "./tools/toolArea.js";
import selectTool from "./tools/toolSelect.js";

window.onload = function() {

  // Setup Paper
  paper.setup('c');

  // ToolBox
  class ToolBox {

    constructor(tools, defaultToolName) {
      this.tools = tools.map(tool => tool(this));
      this.defaultToolName = defaultToolName;
    }

    activateTool(name) {
      const tool = this.tools.find(tool => tool.name === name);
      tool.activate();
    }

    revertToDefault() {
      this.activateTool(this.defaultToolName);
    }

    // TODO: Listen for tool completion and revert to default "select" tool
  }

  // Set up tools
  const toolSelect = selectTool.createToolSelect;
  const toolArea = areaTool.createToolArea;

  // Put them in the toolbox
  const toolBox = new ToolBox([toolSelect, toolArea], 'toolSelect');
  toolBox.activateTool('toolSelect');

  // Attach click handlers for Tool activation on all
  // DOM buttons with class '.tool-button'

  document.querySelectorAll('.tool-button').forEach(toolButton => {
    toolButton.addEventListener('click', e => {
      toolBox.activateTool(e.target.getAttribute('data-tool-name'));
    });
  });
}