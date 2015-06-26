"use strict";

var React = require("react");

module.exports = React.createClass({
	getDefaultProps: function() {
		return {
			size: 1
		};
	},
	render: function() {
		return React.createElement(this.props.component);
	}
});
