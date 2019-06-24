import paper from 'paper';
import tools from "./tools/toolArea.js";

// Install paper
// paper.install(window);

window.onload = function() {
  // Setup Paper
  paper.setup('c');

  // Toolstack

  class ToolStack {
    constructor(tools) {
      this.tools = tools.map(tool => tool());
    }

    activateTool(name) {
      const tool = this.tools.find(tool => tool.name === name);
      tool.activate();
    }
  }

  // Tool Path, draws paths on mouse-drag

  const toolArea = tools.createToolArea;

  // Construct a Toolstack, passing your Tools

  const toolStack = new ToolStack([toolArea]);

  // Activate a certain Tool

  toolStack.activateTool('toolArea');

  // Attach click handlers for Tool activation on all
  // DOM buttons with class '.tool-button'

  document.querySelectorAll('.tool-button').forEach(toolBtn => {
    toolBtn.addEventListener('click', e => {
      toolStack.activateTool(e.target.getAttribute('data-tool-name'));
    });
  });
}