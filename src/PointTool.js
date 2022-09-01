import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tool } from '@psychobolt/react-paperjs';
// import { Rectangle } from 'paper';
// import flatten from 'lodash/flatten';
// import { mapChildren } from './utils';

class PointTool extends Component {
    constructor(props){
        super(props);
        // this.onMouseMove = this.onMouseMove.bind(this);
        // this.onMouseDown = this.onMouseDown.bind(this);
        // this.onMouseDrag = this.onMouseDrag.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }

    onMouseUp(e){
        const { onPathAdd, pathProps, paper } = this.props;
        const { project } = paper;
        const { Path, Point, CompoundPath, Segment } = paper;

        // Pin path
        console.log(e.point);
        var bottom = e.point;
        var top = new Point(e.point.x, e.point.y - 50)
        var arcFrom = new Point(top.x - 20, top.y + 20)
        var arcTo = new Point(top.x + 20, top.y + 20)
        var handleIn = new Point(-20, 0);
        var handleOut = new Point(20, 0);

        var path = new Path();
        path.add(bottom);
        path.add(arcFrom);
        path.add(new Segment(top, handleIn, handleOut));
        path.add(arcTo);
        path.strokeColor = pathProps.strokeColor;
        path.strokeWidth = pathProps.strokeWidth;
        path.fillColor = pathProps.fillColor;

        onPathAdd(path);
    }

    render(){
        return (
            <Tool
                onMouseUp={this.onMouseUp}
            />
        );
    }
}

PointTool.propTypes = {
    onPathAdd: PropTypes.func.isRequired,
    paper: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
}
export default React.forwardRef((props, ref) => <PointTool innerRef={ref} {...props} />); // eslint-disable-line
