/* global window:true */

"use strict";

var _ = require("lodash"),
	React = require("react");

module.exports = React.createClass({
	handleUpClick: function() {
		this.state.stack.pop();
		this.setState({
			stack: this.state.stack
		});
	},
	handlePrevClick: function() {
		this.setState({
			row: this.state.row - 1
		});
	},
	handleNextClick: function() {
		this.setState({
			row: this.state.row + 1
		});
	},
	createTile: function(tile, i, tiles) {
		var defaultOnClick = function() {
			if (tile.subtiles) {
				this.state.stack.push(tile.subtiles);
				this.setState({
					stack: this.state.stack
				});
			}
		}.bind(this);

		var last = i === tiles.length - 1;
		var remaining = last ? this.state.remaining : 0;

		return React.createElement("div", {
			className: "tile",
			onClick: tile.onClick || defaultOnClick,
			style: {
				width: (this.state.cellSize * tile.size) + remaining,
			}
		}, React.createElement("div", {
			className: "content " + tile.className
		}, tile.content));
	},
	calculateState: function() {
		var cellCount = Math.floor(window.innerWidth / this.props.desiredCellWidth);
		cellCount = Math.max(this.props.minCellCount, cellCount);

		var cellSize = Math.floor(window.innerWidth / cellCount);

		// Sub-pixel remaining.
		var remaining = window.innerWidth - (cellSize * cellCount);

		return {
			cellCount: cellCount,
			cellSize: cellSize,
			remaining: remaining
		};
	},
	getDefaultProps: function() {
		return {
			desiredCellWidth: 100,
			minCellCount: 4
		};
	},
	getInitialState: function() {
		return _.assign(this.calculateState(), {
			stack: [this.props.tiles],
			row: 0
		});
	},
	handleResize: function() {
		this.setState(_.assign(this.calculateState(), {
			row: 0
		}));
	},
	componentWillMount: function() {
		this.props.upTile.onClick = this.handleUpClick;
		this.props.prevTile.onClick = this.handlePrevClick;
		this.props.nextTile.onClick = this.handleNextClick;
	},
	componentDidMount: function() {
		window.addEventListener("resize", this.handleResize);
	},
	componentWillUnmount: function() {
		window.removeEventListener("resize", this.handleResize);
	},
	render: function() {
		var rows = [];
		var tiles = _.clone(_.last(this.state.stack));

		while (tiles.length > 0) {
			var row = [];
			var cellAvailable = this.state.cellCount - 1;
			while (tiles.length > 0 && cellAvailable - tiles[0].size >= 0) {
				cellAvailable = cellAvailable - tiles[0].size;
				row.push(tiles.shift());
			}

			if(tiles.length > 0) {
				tiles.unshift(row.pop());
				row.push(this.props.nextTile);
			}

			if (row.length === 0) {
				break;
			}

			rows.push(row);
		}

		if (this.state.stack.length > 1) {
			_.first(rows).unshift(this.props.upTile);
		} else {
			_.first(rows).unshift(this.props.brandTile);
		}

		_.forEach(_.rest(rows), function(row) {
			row.unshift(this.props.prevTile);
		}, this);

		return React.createElement("div", {
			className: "ribbon"
		}, _.map(rows[this.state.row], this.createTile));
	}
});
