(function () {
  window["Reuters"] = window["Reuters"] || {};
  window["Reuters"]["Graphics"] = window["Reuters"]["Graphics"] || {};
  window["Reuters"]["Graphics"]["pieCharter"] = window["Reuters"]["Graphics"]["pieCharter"] || {};
  window["Reuters"]["Graphics"]["pieCharter"]["Template"] = window["Reuters"]["Graphics"]["pieCharter"]["Template"] || {};

  window["Reuters"]["Graphics"]["pieCharter"]["Template"]["piesetup"] = function (t) {
    var __t,
        __p = '',
        __j = Array.prototype.join;
    function print() {
      __p += __j.call(arguments, '');
    }

    if (t.self.hasLegend) {
      ;
      __p += '\n	<div class="pie-legend d-flex flex-row flex-wrap justify-content-center">\n		';
      t.self.colorDomain.forEach(function (d, i) {
        ;
        __p += '\n			<div class="legend-item d-flex flex-row mr-1">\n				<div class="pie-legend-box" style="background-color:' + ((__t = t.self.colorRange[i]) == null ? '' : __t) + ';"></div>\n				<div class="pie-legend-text">' + ((__t = d) == null ? '' : __t) + '</div>\n			</div>\n		';
      });
      __p += '\n	</div>\n';
    };
    __p += '\n<div id="' + ((__t = t.self.targetDiv + '-chart') == null ? '' : __t) + '"></div>';
    return __p;
  };
})();
(function () {
  window["Reuters"] = window["Reuters"] || {};
  window["Reuters"]["Graphics"] = window["Reuters"]["Graphics"] || {};
  window["Reuters"]["Graphics"]["pieCharter"] = window["Reuters"]["Graphics"]["pieCharter"] || {};
  window["Reuters"]["Graphics"]["pieCharter"]["Template"] = window["Reuters"]["Graphics"]["pieCharter"]["Template"] || {};

  window["Reuters"]["Graphics"]["pieCharter"]["Template"]["pietooltip"] = function (t) {
    var __t,
        __p = '';
    __p += '<p class="muted text-uppercase">' + ((__t = t.d.year) == null ? '' : __t) + ' ' + ((__t = t.d.election_type) == null ? '' : __t) + '</p>\n<p class="tooltip-title">' + ((__t = t.d.party_name_english) == null ? '' : __t) + '</p>\n<p class="tooltip-display">' + ((__t = t.d.seats) == null ? '' : __t) + ' Seats</p>\n<p class="tooltip-display">' + ((__t = t.d['left-right-text']) == null ? '' : __t) + '</p>';
    return __p;
  };
})();
Reuters = Reuters || {};
Reuters.Graphics = Reuters.Graphics || {};
//the view that constructs a linechart
Reuters.Graphics.donut = Backbone.View.extend({
	margin: { top: 10, left: 50, right: 0, bottom: 0 },
	duration: 1500,
	delay: 500,
	startAngle: -90,
	endAngle: 90,
	tooltipTemplate: Reuters.Graphics.pieCharter.Template.pietooltip,
	setupTemplate: Reuters.Graphics.pieCharter.Template.piesetup,

	initialize: function initialize(opts) {
		var self = this;
		this.options = opts;

		// if we are passing in options, use them instead of the defualts.
		_.each(opts, function (item, key) {
			self[key] = item;
		});

		self.loadData();
	},

	loadData: function loadData() {
		var self = this;
		//Test which way data is presented and load appropriate way
		if (this.dataURL.indexOf("csv") == -1 && !_.isObject(this.dataURL)) {
			d3.json(self.dataURL, function (data) {
				self.parseData(data);
			});
		}
		if (this.dataURL.indexOf("csv") > -1) {
			d3.csv(self.dataURL, function (data) {
				self.parseData(data);
			});
		}
		if (_.isObject(this.dataURL)) {
			setTimeout(function () {
				self.parseData(self.dataURL);
			}, 100);
		}
	},

	parseData: function parseData(data) {
		var self = this;

		if (!self.colorDomain) {
			self.colorDomain = _.uniq(_.pluck(data, self.colorValue));
		}
		self.color = d3.scale.ordinal().domain(self.colorDomain).range(self.colorRange);

		if (self.upsideDown) {
			self.startAngle = -90;
			self.endAngle = -270;
		}

		if (self.wholePie) {
			self.startAngle = 0;
			self.endAngle = 360;
		}

		data.forEach(function (d) {
			d[self.plotValue] = parseFloat(d[self.plotValue]);
			if (isNaN(d[self.plotValue])) {
				d[self.plotValue] = 0;
			}
			if (self.multiArcs) {
				d.arcName = d[self.multiArcs];
			} else {
				d.arcName = "value";
			}
		});

		if (self.multiArcs) {
			self.multiArray = _.uniq(_.pluck(data, self.multiArcs));
			if (self.multiSort) {
				self.multiArray = self.multiSort;
			}
			self.data = self.multiArray.map(function (d) {
				return {
					name: d,
					values: _.groupBy(data, self.multiArcs)[d]
				};
			});
		} else {
			self.multiArray = ["value"];
			self.data = [{
				name: "value",
				values: data
			}];
		}

		self.numberOfItems = self.multiArray.length;

		console.log(self.data);

		self.baseRender();
	},

	baseRender: function baseRender() {
		var self = this;
		self.trigger("baseRender:start");

		if (self.multiArcs) {
			self.margin.bottom = 40;
		}

		//make a label based on the div's ID to use as unique identifiers 
		self.targetDiv = self.$el.attr("id");
		self.$el.html(self.setupTemplate({ self: self }));
		self.$chartEl = $("#" + self.targetDiv + "-chart");
		self.chartDiv = self.$el.attr("id") + "-chart";

		//set the width and the height to be the width and height of the div the chart is rendered in
		self.width = self.$chartEl.width() - self.margin.left - self.margin.right;
		//if no height set, square, otherwise use the set height, if lower than 10, it is a ratio to width
		if (!self.options.height) {
			self.height = self.$chartEl.width() - self.margin.top - self.margin.bottom;
		}
		if (self.options.height < 10) {
			self.height = self.$chartEl.width() * self.options.height - self.margin.top - self.margin.bottom;
			self.svgHeight = self.height;
		}

		self.heightTranslate = self.height / 2;
		if (self.upsideDown) {
			self.heightTranslate = 0;
		}

		if (self.options.donutHoleSize !== 0) {
			self.svgHeight = self.height / 2;
		}

		if (!self.radius) {
			self.radius = Math.min(self.width, self.height) / 2;
		}
		if (!self.options.donutHoleSize && self.options.donutHoleSize !== 0) {
			self.donutHoleSize = self.radius / 2;
		}
		if (self.options.donutHoleSize < 10 && self.options.donutHoleSize > 0) {
			self.donutHoleSize = self.radius / self.donutHoleSize;
		}
		if (self.options.donutHoleSize === 0) {
			self.donutHoleSize = self.radius;
		}

		//create an SVG
		self.svg = d3.select("#" + self.chartDiv).append("svg").attr({
			width: self.width + self.margin.left + self.margin.right,
			height: self.svgHeight + self.margin.top + self.margin.bottom
		}).append("g").attr("transform", "translate(" + self.width / 2 + "," + self.heightTranslate + ")");

		self.arc = {};
		self.multiArray.forEach(function (d, i) {
			var widthOfArc = (self.radius - self.donutHoleSize) / self.numberOfItems;
			var outter = self.radius - widthOfArc * i;
			var inner = self.radius - widthOfArc * (i + 1);
			self.arc[d] = d3.svg.arc().outerRadius(outter).innerRadius(inner);
		});

		self.pie = d3.layout.pie().sort(function (a, b) {

			aColor = self.colorDomain.indexOf(a[self.colorValue]);
			bColor = self.colorDomain.indexOf(b[self.colorValue]);
			aValue = a[self.plotValue];
			bValue = b[self.plotValue];

			if (aColor < bColor) {
				return -1;
			}
			if (aColor > bColor) {
				return 1;
			}
			if (aColor == bColor) {
				if (aValue < bValue) {
					return 1;
				}
				if (aValue > bValue) {
					return -1;
				}
				if (aValue == bValue) {
					return 0;
				}
			}
			return 0;
		}).value(function (d) {
			return d[self.plotValue];
		}).startAngle(self.startAngle * (Math.PI / 180)).endAngle(self.endAngle * (Math.PI / 180));

		self.pieCharts = self.svg.selectAll(".pieChart").data(self.data, function (d) {
			return d.name;
		}).enter().append("g");

		self.addArcs = self.pieCharts.selectAll(".arc").data(function (d) {
			return self.pie(d.values);
		}).enter().append("g").attr("class", "arc");

		self.addArcs.append("path").attr("d", function (d) {
			return self.arc[d.data.arcName](d);
		}).style("fill", function (d) {
			return self.color(d.data[self.colorValue]);
		}).attr("title", function (d) {
			return self.tooltipTemplate({ d: d.data });
		});

		$(".arc path").tooltip({ html: true, placement: "bottom" });

		if (self.multiArcs) {
			self.svg.selectAll(".arcLabels").data(self.multiSort).enter().append("text").attr("y", 20).attr("x", function (d, i) {
				var divisions = self.multiSort.length;
				var index = Math.abs(i - divisions + 1);
				console.log(index);
				var radiusChunk = self.radius / divisions;
				return self.donutHoleSize + radiusChunk * index;
			}).text(function (d) {
				return d;
			});
		}

		$(window).on("resize", _.debounce(function (event) {
			self.update();
		}, 100));

		self.trigger("baseRender:end");
		//end of chart render			
		return this;
	},

	update: function update() {
		var self = this;

		//set the width and the height to be the width and height of the div the chart is rendered in
		self.width = self.$chartEl.width() - self.margin.left - self.margin.right;
		//if no height set, square, otherwise use the set height, if lower than 10, it is a ratio to width
		if (!self.options.height) {
			self.height = self.$chartEl.width() - self.margin.top - self.margin.bottom;
		}
		if (self.options.height < 10) {
			self.height = self.$chartEl.width() * self.options.height - self.margin.top - self.margin.bottom;
			self.svgHeight = self.height;
		}

		self.heightTranslate = self.height / 2;
		if (self.upsideDown) {
			self.heightTranslate = 0;
		}

		if (self.options.donutHoleSize !== 0) {
			self.svgHeight = self.height / 2;
		}

		if (!self.options.radius) {
			self.radius = Math.min(self.width, self.height) / 2;
		}
		if (!self.options.donutHoleSize && self.options.donutHoleSize !== 0) {
			self.donutHoleSize = self.radius / 2;
		}
		if (self.options.donutHoleSize < 10 && self.options.donutHoleSize > 0) {
			self.donutHoleSize = self.radius / self.options.donutHoleSize;
		}
		if (self.options.donutHoleSize === 0) {
			self.donutHoleSize = self.radius;
		}

		//create an SVG
		d3.select("#" + self.chartDiv + " svg").transition().attr({
			width: self.width + self.margin.left + self.margin.right,
			height: self.svgHeight + self.margin.top + self.margin.bottom
		});

		self.svg.transition().attr("transform", "translate(" + self.width / 2 + "," + self.heightTranslate + ")");

		self.multiArray.forEach(function (d, i) {
			var widthOfArc = (self.radius - self.donutHoleSize) / self.numberOfItems;
			var outter = self.radius - widthOfArc * i;
			var inner = self.radius - widthOfArc * (i + 1);
			self.arc[d].outerRadius(outter).innerRadius(inner);
		});

		self.addArcs.selectAll("path").transition().attr("d", function (d) {
			return self.arc[d.data.arcName](d);
		});
	}

});
//# sourceMappingURL=pieCharter.js.map
