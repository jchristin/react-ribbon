/* global window:true */

"use strict";

var _ = require("lodash"),
	React = require("react"),
	Tile = require("./tile");

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
		var last = i === tiles.length - 1;
		var remaining = last ? this.state.remaining : 0;

		return React.createElement("div", {
			className: "tile",
			onClick: tile.props.onClick,
			style: {
				width: (this.state.cellSize * tile.props.size) + remaining,
			}
		}, tile);
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
			stack: [this.props.children],
			row: 0
		});
	},
	handleResize: function() {
		this.setState(_.assign(this.calculateState(), {
			row: 0
		}));
	},
	componentWillMount: function() {
		this.brandTile = React.createElement(Tile, {
			component: this.props.brandTile,
		});

		this.upTile = React.createElement(Tile, {
			component: this.props.upTile,
			onClick: this.handleUpClick
		});

		this.prevTile = React.createElement(Tile, {
			component: this.props.prevTile,
			onClick: this.handlePrevClick
		});

		this.nextTile = React.createElement(Tile, {
			component: this.props.nextTile,
			onClick: this.handleNextClick
		});

		var ribbon = this;
		var setDownClick = function(component) {
			if(React.Children.count(component.props.children) > 0) {
				component.props.onClick = function() {
					ribbon.state.stack.push(component.props.children);
					ribbon.setState({
						stack: ribbon.state.stack
					});
				};

				React.Children.forEach(component.props.children, setDownClick);
			}
		};

		React.Children.forEach(this.props.children, setDownClick);
	},
	componentDidMount: function() {
		window.addEventListener("resize", this.handleResize);
	},
	componentWillUnmount: function() {
		window.removeEventListener("resize", this.handleResize);
	},
	render: function() {
		var rows = [];
		var tiles = [];

		React.Children.forEach(_.last(this.state.stack), function(child) {
			tiles.push(child);
		});

		while (tiles.length > 0) {
			var row = [];
			var cellAvailable = this.state.cellCount - 1;
			while (tiles.length > 0 && cellAvailable - tiles[0].props.size >= 0) {
				cellAvailable = cellAvailable - tiles[0].props.size;
				row.push(tiles.shift());
			}

			if (tiles.length > 0) {
				tiles.unshift(row.pop());
				row.push(this.nextTile);
			}

			if (row.length === 0) {
				break;
			}

			rows.push(row);
		}

		if (this.state.stack.length > 1) {
			_.first(rows).unshift(this.upTile);
		} else {
			_.first(rows).unshift(this.brandTile);
		}

		_.forEach(_.rest(rows), function(row) {
			row.unshift(this.prevTile);
		}, this);

		return React.createElement("div", {
			className: "ribbon"
		}, _.map(rows[this.state.row], this.createTile));
	}
});
