import paper from 'paper';

/* Selection tool */
const createToolSelect = function(toolBox) {
  const tool = new paper.Tool();
  tool.name = 'toolSelect';

  tool.onMouseDown = function(event) {
    console.log("Select: Mouse down");
  }

  tool.onKeyUp = function (event) {
    if (event.key === "Escape") {
      // TODO
    }
  }

  tool.onMouseMove = function(event) {
    // TODO
  }

  return tool;
}

export default {
  createToolSelect: createToolSelect
}
