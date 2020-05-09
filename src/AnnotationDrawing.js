import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { OSDReferences } from 'mirador/dist/es/src/plugins/OSDReferences';
import { PaperContainer } from '@psychobolt/react-paperjs';
import { RectangleTool } from '@psychobolt/react-paperjs-editor';
import { Point } from 'paper';

/** */
class AnnotationDrawing extends Component {
  /** */
  constructor(props) {
    super(props);

    this.addPath = this.addPath.bind(this);
  }

  /** */
  componentDidMount() {
    const { windowId } = this.props;
    this.OSDReference = OSDReferences.get(windowId).current;
  }

  /** */
  addPath(path) {
    const { updateGeometry } = this.props;
    const { bounds } = path;
    const {
      x, y, width, height,
    } = bounds;

    updateGeometry({
      svg: path.exportSVG({
        asString: true,
      }),
      xywh: [
        Math.floor(x),
        Math.floor(y),
        Math.floor(width),
        Math.floor(height),
      ].join(','),
    });
  }


  /** */
  paperThing() {
    const { activeTool } = this.props;
    if (!activeTool) return null;
    // Setup Paper View to have the same center and zoom as the OSD Viewport
    const viewportZoom = this.OSDReference.viewer.viewport.getZoom(true);
    const image1 = this.OSDReference.viewer.world.getItemAt(0);
    const center = this.OSDReference.viewer.viewport.viewportToImageCoordinates(
      this.OSDReference.viewer.viewport.getCenter(true),
    );
    const viewProps = {
      center: new Point(center.x, center.y),
      zoom: image1.viewportToImageZoom(viewportZoom),
    };

    return (
      <div
        className="foo"
        style={{
          height: '100%', left: 0, position: 'absolute', top: 0, width: '100%',
        }}
      >
        <PaperContainer
          canvasProps={{ style: { height: '100%', width: '100%' } }}
          viewProps={viewProps}
        >
          <RectangleTool
            onPathAdd={this.addPath}
            pathProps={{ fillColor: null, strokeColor: '#00BFFF' }}
          />
        </PaperContainer>
      </div>
    );
  }

  /** */
  render() {
    const { windowId } = this.props;
    this.OSDReference = OSDReferences.get(windowId).current;
    return (
      <>
        {ReactDOM.createPortal(this.paperThing(), this.OSDReference.viewer.element)}
      </>
    );
  }
}

AnnotationDrawing.propTypes = {
  activeTool: PropTypes.string,
  updateGeometry: PropTypes.func.isRequired,
  windowId: PropTypes.string.isRequired,
};

AnnotationDrawing.defaultProps = {
  activeTool: null,
};


export default AnnotationDrawing;
