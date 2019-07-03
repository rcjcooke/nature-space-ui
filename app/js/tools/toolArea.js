import paper from 'paper';

/* Area drawing tool */

const createToolArea = function(toolBox) {
  const tool = new paper.Tool();
  tool.name = 'toolArea';

  var areaPath;
  var drawingAidItems, cueItems;

  tool.onMouseDown = function(event) {
    // On left click only (event is a ToolEvent, event.event is a MouseEvent)
    if (event.event.button == 0) {

      // Get the new point (adjusted for snaps)
      var snappedPoint = checkSnapPoint(event.point);

      if (!areaPath) {
        startDrawingArea(snappedPoint);
      } else {
        if (snappedPoint == areaPath.firstSegment.point) {
          stopDrawingArea(true);
        } else {
          addCorner(snappedPoint);
        }
      }
    }
  }

  tool.onKeyUp = function (event) {
    if (event.key === "Escape") {
      stopDrawingArea(false);
    }
  }

  tool.onMouseMove = function(event) {
    if (areaPath) {
      var snappedPoint = checkSnapPoint(event.point);
      drawPotentialPointCue(snappedPoint);
    }
  }

  function startDrawingArea(point) {
    areaPath = new paper.Path();
    areaPath.strokeColor = 'black';
    areaPath.closed = false;
  
    drawingAidItems = [];
  
    addCorner(point);
  }
  
  function addCorner(point) {
  
    // Add the point to the path
    areaPath.add(point);
  
    // Indicate to the user that they've created a point
    drawPoint(point);
  }
  
  function drawPoint(point) {
    var userPoint = new paper.Path.Circle({
      center: point,
      radius: 5,
      strokeColor: 'black',
      fillColor: 'white'
    });
    drawingAidItems.push(userPoint);
  
    var label = new paper.PointText(point + new paper.Point(5,0));
    label.content = '' + point.x + ',' + point.y;
    label.fillColor = 'black';
    drawingAidItems.push(label);
  }
  
  function stopDrawingArea(closed) {
    // Close the area
    if (areaPath) {
      if (closed) {
        areaPath.closed = true;
      } else {
        areaPath.remove();
      }
    }
    // Clear up the cue and drawing aid items
    if (cueItems) {
      for (var i = 0, l = cueItems.length; i < l; i++) {
        cueItems[i].remove();
      }
    }
    if (drawingAidItems) {
      for (var i = 0, l = drawingAidItems.length; i < l; i++) {
        drawingAidItems[i].remove();
      }
    }

    // Tell others that we're done
    toolBox.revertToDefault();
  }

  function drawPotentialPointCue(point) {
    // Clean up items from last call
    if (cueItems) {
      for (var i = 0, l = cueItems.length; i < l; i++) {
        cueItems[i].remove();
      }
    }
    cueItems = [];
    
    // Provide the visual indication of where the next point is going to go
    drawNewSidesCue(point);
    // Update the distance cues
    drawLengthText(areaPath.firstSegment.point, point, 1);
    drawLengthText(point, areaPath.lastSegment.point, 1);
    // Provide a view of the angle from the last side
    if (areaPath.segments.length > 1) {
      drawAngleCue(areaPath.lastSegment.previous.point, areaPath.lastSegment.point, point);
    }
  }
  
  function drawNewSidesCue(point) {
    var nextPointPath = new paper.Path();
    nextPointPath.addSegments([areaPath.firstSegment.point, point, areaPath.lastSegment.point]);
    nextPointPath.strokeColor = 'black';
    nextPointPath.dashArray = [10, 4];
  
    cueItems.push(nextPointPath);
  
    var label = new paper.PointText(point.add(new paper.Point(5,0)));
    label.content = '' + point.x + ',' + point.y;
    label.fillColor = 'black';
    cueItems.push(label);
  
  }
  
  function drawLengthText(from, to, sign, value) {
    var lengthSize = 5;
    if ((to - from).length < lengthSize * 4) return;
    
    var vector = to.subtract(from);
    var awayVector = vector.normalize(lengthSize).rotate(90 * sign);
    var middle = from.add(awayVector).add(vector.normalize(vector.length / 2));
    // Length Label
    var textAngle = Math.abs(vector.angle) > 90 ? textAngle = 180 + vector.angle : vector.angle;
    // Label needs to move away by different amounts based on the
    // vector's quadrant:
    var away = (sign >= 0 ? [1, 4] : [2, 3]).indexOf(vector.quadrant) != -1 ? 8 : 0;
    value = value || vector.length;
    var text = new paper.PointText({
      point: middle.add(awayVector.normalize(away + lengthSize)),
      content: '' + Math.round(value * 1000) / 1000,
      fillColor: 'black',
      justification: 'center'
    });
    text.rotate(textAngle);
    cueItems.push(text);
  }
  
  function drawAngleCue(sourcePoint, centrePoint, nextPoint) {
    var toNPVector = nextPoint.subtract(centrePoint);
    var toSPVector = sourcePoint.subtract(centrePoint);
    var angle = toSPVector.getDirectedAngle(toNPVector);
  
    var radius = 25, threshold = 10;
    if (toNPVector.length < radius + threshold || Math.abs(angle) < 15) return;
    
    var fromVector = toSPVector.normalize(radius);
    var throughVector = fromVector.rotate(angle / 2);
    var toVector = fromVector.rotate(angle);
    var angleArcPath = new paper.Path.Arc(centrePoint.add(fromVector), centrePoint.add(throughVector), centrePoint.add(toVector));
    angleArcPath.strokeColor = 'black';
    angleArcPath.dashArray = [10, 4];
    cueItems.push(angleArcPath);
    
    // Angle Label
    var text = new paper.PointText({
      point: centrePoint.add(throughVector.normalize(radius + 15)).add(new paper.Point(0, 3)),
      content: Math.round(Math.abs(angle)) + '°',
      fillColor: 'black',
      justification: 'center'
    });
    cueItems.push(text);
  }
  
  /* Check Snaps */
  function checkSnapPoint(point) {
  
    // Snap to first point for area completion
    if (areaPath) {
      if (point.getDistance(areaPath.firstSegment.point) < 20) {
        return areaPath.firstSegment.point;
      }
    }
  
    // Snap to 90 degrees from the last point
    if (areaPath && areaPath.segments.length > 1) {
      var toNPVector = point.subtract(areaPath.lastSegment.point);
      var toSPVector = areaPath.lastSegment.previous.point.subtract(areaPath.lastSegment.point);
      var angle = toSPVector.getDirectedAngle(toNPVector);
    
      if (Math.abs(Math.abs(angle) - 90) < 5) {
        var newPoint = areaPath.lastSegment.point.add(toSPVector.normalize(toNPVector.length));
        return newPoint.rotate(90 * (angle < 0 ? -1 : 1), areaPath.lastSegment.point);
      }
    }
  
    // If we've got this far then none of the snaps applied so just return the original point
    return point;
  }
  
  return tool;
}

export default {
  createToolArea: createToolArea
}
