/* global window:true */

"use strict";

var _ = require("lodash"),
	React = require("react"),
	desiredCellSize = 100;

module.exports = React.createClass({
	createBrandTile: function() {
		return {
			size: 1,
			content: React.createElement("img", {
				src: "img/logo.svg"
			})
		};
	},
	createUpTile: function() {
		return {
			size: 1,
			onClick: this.handleUpClick,
			className: "up",
			content: React.createElement("i", {
				className: "fa fa-arrow-circle-o-up",
			})
		};
	},
	createPrevTile: function() {
		return {
			size: 1,
			onClick: this.handlePrevClick,
			className: "prev",
			content: React.createElement("i", {
				className: "fa fa-arrow-circle-o-left",
			})
		};
	},
	createNextTile: function() {
		return {
			size: 1,
			onClick: this.handleNextClick,
			className: "next",
			content: React.createElement("i", {
				className: "fa fa-ellipsis-h",
			})
		};
	},
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
		var cellCount = Math.floor(window.innerWidth / desiredCellSize);

		// At least 4 cells.
		cellCount = Math.max(4, cellCount);

		var cellSize = Math.floor(window.innerWidth / cellCount);

		// Sub-pixel remaining.
		var remaining = window.innerWidth - (cellSize * cellCount);

		return {
			cellCount: cellCount,
			cellSize: cellSize,
			remaining: remaining
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
				row.push(this.createNextTile());
			}

			if (row.length === 0) {
				break;
			}

			rows.push(row);
		}

		if (this.state.stack.length > 1) {
			_.first(rows).unshift(this.createUpTile());
		} else {
			_.first(rows).unshift(this.createBrandTile());
		}

		_.forEach(_.rest(rows), function(row) {
			row.unshift(this.createPrevTile());
		}, this);

		return React.createElement("div", {
			className: "ribbon"
		}, _.map(rows[this.state.row], this.createTile));
	}
});
