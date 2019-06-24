import paper from 'paper';
import tools from "./tools/toolArea.js";

window.onload = function() {

  // Setup Paper
  paper.setup('c');

  // ToolBox
  class ToolBox {
    constructor(tools) {
      this.tools = tools.map(tool => tool());
    }

    activateTool(name) {
      const tool = this.tools.find(tool => tool.name === name);
      tool.activate();
    }
  }

  // Set up tools
  const toolArea = tools.createToolArea;

  // Create the 
  const toolBox = new ToolBox([toolArea]);
  toolBox.activateTool('toolArea');

  // Attach click handlers for Tool activation on all
  // DOM buttons with class '.tool-button'

  document.querySelectorAll('.tool-button').forEach(toolButton => {
    toolButton.addEventListener('click', e => {
      toolBox.activateTool(e.target.getAttribute('data-tool-name'));
    });
  });
}