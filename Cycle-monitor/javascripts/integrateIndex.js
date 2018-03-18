// Vue component define
var demo = new Vue({
  el: '#table',
  data: {
    people_count: 0,
    scatterCategory: ['area1', 'area2', 'area3', 'area4', 'area5', 'area6', 'area7', 'area8', 'area9', 'area10', 'area11', 'area12', 'area13', 'area14', 'area15'],
    selectScaCate: ['area1', 'area2', 'area4', 'area5', 'area9'],
    sensorDockerFunc: null
  },
  methods: {
    displayMem: function () {
      var data = [
        {time: '10:01', used: 200, extra: 500, total: 1000},
        {time: '10:02', used: 220, extra: 600, total: 1000},
        {time: '10:03', used: 300, extra: 800, total: 1000},
        {time: '10:04', used: 140, extra: 700, total: 1000},
        {time: '10:05', used: 100, extra: 700, total: 1000},
        {time: '10:06', used: 200, extra: 700, total: 1000},
        {time: '10:07', used: 50, extra: 700, total: 1000},
        {time: '10:08', used: 350, extra: 700, total: 1000},
        {time: '10:09', used: 250, extra: 700, total: 1000}
      ];

      var category = ['used'];

      var hAxis = 10, mAxis = 10;

      //generation function
      function generate(data, id, axisNum) {
        var margin = {top: 20, right: 18, bottom: 35, left: 28},
            width = $(id).width() - margin.left - margin.right,
            height = $(id).height() - margin.top - margin.bottom;

        var parseDate = d3.time.format("%H:%M").parse;
        var formatPercent = d3.format(".0%");

        var legendSize = 10,
            legendColor = 'rgba(0, 160, 233, 0.7)';

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(d3.time.minutes, Math.floor(data.length/axisNum))
            .tickSize(-height)
            .tickPadding([6])
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(y)
            .ticks(10)
            .tickSize(-width)
            .tickFormat(formatPercent)
            .orient("left");

        var ddata = (function() {
          var temp = [];
          for (var i=0; i<data.length; i++) {
            temp.push({'time': parseDate(data[i]['time']), 'used': data[i]['used'], 'extra': data[i]['extra'], 'total': data[i]['total']});
          }
          
          return temp;
        })();

         //console.log(ddata);

        x.domain(d3.extent(ddata, function(d) { return d.time; }));

        var area = d3.svg.area()
            .x(function(d) { return x(d.time); })
            .y0(height)
            .y1(function(d) { return y(d['used']/d['total']); })
            .interpolate("cardinal");

        d3.select('#svg-mem').remove();

        var svg = d3.select(id).append("svg")
            .attr("id", "svg-mem")
            .attr("width", width+margin.right+margin.left)
            .attr("height", height+margin.top+margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .attr("id", "mem-x-axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        var path = svg.append("svg:path")
            .datum(ddata)
            .attr("class", "areaM")
            .attr("d", area);

        var points = svg.selectAll(".gPoints")
            .data(ddata)
            .enter().append("g")
            .attr("class", "gPoints");

        //legend rendering
        var legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(0,'+ (height + margin.bottom - legendSize * 1.2) +')');

        legend.append('rect')
            .attr('width', legendSize)
            .attr('height', legendSize)
            .style('fill', legendColor);

        legend.append('text')
            .data(ddata)
            .attr('x', legendSize*1.2)
            .attr('y', legendSize/1.1)
            .text('used');

        points.selectAll(".memtipPoints")
            .data(ddata)
            .enter().append("circle")
            .attr("class", "memtipPoints")
            .attr("cx", function (d) {
              return x(d.time);
            })
            .attr("cy", function (d) {
              return y(d['used']/d['total']);
            })
            .attr("r", "6px")
            .on("mouseover", function (d) {
              console.log(this);

              d3.select(this).transition().duration(100).style("opacity", 1);

              svg.append("g")
                  .attr("class", "tipDot")
                  .append("line")
                  .attr("class", "tipDot")
                  .transition()
                  .duration(50)
                  .attr("x1", x(d['time']))
                  .attr("x2", x(d['time']))
                  .attr("y2", height);

              // svg.append("circle")
              //   .attr('class', 'tipDot')
              //   .attr("cx", x(d['time']))
              //   .attr("cy", y(0))
              //   .attr("r", "4px");

              // svg.append("circle")
              //   .attr('class', 'tipDot')
              //   .attr("cx", x(d['time']))
              //   .attr("cy", y(1))
              //   .attr("r", "4px");

              svg.append("polyline")      // attach a polyline
                  .attr("class", "tipDot")  // colour the line
                  .style("fill", "black")     // remove any fill colour
                  .attr("points", (x(d['time'])-3.5)+","+(y(1)-2.5)+","+x(d['time'])+","+(y(1)+6)+","+(x(d['time'])+3.5)+","+(y(1)-2.5));

              svg.append("polyline")      // attach a polyline
                  .attr("class", "tipDot")  // colour the line
                  .style("fill", "black")     // remove any fill colour
                  .attr("points", (x(d['time'])-3.5)+","+(y(0)+2.5)+","+x(d['time'])+","+(y(0)-6)+","+(x(d['time'])+3.5)+","+(y(0)+2.5));

              $(this).tooltip({
                'container': 'body',
                'placement': 'left',
                'title': 'Used' + ' | ' + formatPercent(d['used']/d['total']),
                'trigger': 'hover'
              })
                  .tooltip('show');
            })
            .on("mouseout",  function (d) {
              d3.select(this).transition().duration(100).style("opacity", 0);

              d3.selectAll('.tipDot').transition().duration(100).remove();

              $(this).tooltip('destroy');
            });

        this.getOpt = function() {
          var axisOpt = new Object();
          axisOpt['x'] = x;
          axisOpt['y'] = y;
          axisOpt['xAxis'] = xAxis;
          axisOpt['width'] = width;
          axisOpt['height'] = height;

          return axisOpt;
        }

        this.getSvg = function() {
          var svgD = new Object();
          svgD['svg'] = svg;
          svgD['points'] = points;
          svgD['area'] = area;
          svgD['path'] = path;

          return svgD;
        }
      }

      //redraw function
      function redraw(data, id, x, y, xAxis, svg, area, path, points, height, axisNum) {
        //format of time data
        var parseDate = d3.time.format("%H:%M").parse;
        
        var formatPercent = d3.format(".0%");

        var ddata = (function() {
          var temp = [];

          for (var i=0; i<data.length; i++) {
            temp.push({'time': parseDate(data[i]['time']), 'used': data[i]['used'], 'extra': data[i]['extra'], 'total': data[i]['total']});
          }
          return temp;
        })();

        x.domain(d3.extent(ddata, function(d) {
          return d['time'];
        }));

        xAxis.ticks(d3.time.minutes, Math.floor(data.length / axisNum));

        svg.select("#mem-x-axis")
            .transition()
            .duration(200)
            .ease("sin-in-out")
            .call(xAxis);

        //area line updating
        path.datum(ddata)
            .transition()
            .duration(200)
            .attr("class", "areaM")
            .attr("d", area);

        //circle updating
        points.selectAll(".memtipPoints")
            .data(ddata)
            .attr("class", "memtipPoints")
            .attr("cx", function (d) {
              return x(d.time);
            })
            .attr("cy", function (d) {
              return y(d['used']/d['total']);
            })
            .attr("r", "6px");

        //draw new dot
        points.selectAll(".memtipPoints")
            .data(ddata)
            .enter().append("circle")
            .attr("class", "memtipPoints")
            .attr("cx", function (d) {
              return x(d.time);
            })
            .attr("cy", function (d) {
              return y(d['used']/d['total']);
            })
            .attr("r", "6px")
            .on("mouseover", function (d) {
              d3.select(this).transition().duration(100).style("opacity", 1);

              svg.append("g")
                  .attr("class", "tipDot")
                  .append("line")
                  .attr("class", "tipDot")
                  .transition()
                  .duration(50)
                  .attr("x1", x(d['time']))
                  .attr("x2", x(d['time']))
                  .attr("y2", height);

              svg.append("polyline")      // attach a polyline
                  .attr("class", "tipDot")  // colour the line
                  .style("fill", "black")     // remove any fill colour
                  .attr("points", (x(d['time'])-3.5)+","+(y(1)-2.5)+","+x(d['time'])+","+(y(1)+6)+","+(x(d['time'])+3.5)+","+(y(1)-2.5));

              svg.append("polyline")      // attach a polyline
                  .attr("class", "tipDot")  // colour the line
                  .style("fill", "black")     // remove any fill colour
                  .attr("points", (x(d['time'])-3.5)+","+(y(0)+2.5)+","+x(d['time'])+","+(y(0)-6)+","+(x(d['time'])+3.5)+","+(y(0)+2.5));

              $(this).tooltip({
                'container': 'body',
                'placement': 'left',
                'title': 'Used' + ' | ' +formatPercent(d['used']/d['total']),
                'trigger': 'hover'
              })
                  .tooltip('show');
            })
            .on("mouseout",  function (d) {
              d3.select(this).transition().duration(100).style("opacity", 0);

              d3.selectAll('.tipDot').transition().duration(100).remove();

              $(this).tooltip('destroy');
            });

        //remove old dot
        points.selectAll(".memtipPoints")
            .data(ddata)
            .exit()
            .transition()
            .duration(200)
            .remove();

      }

      //inits chart
      var sca = new generate(data, "#sensor-mem-area-d3", 8);

      //dynamic data and chart update
      setInterval(function() {
        //update donut data
        data.push({time: hAxis + ":" + mAxis, used: Math.random()*100*0.70, extra: Math.random()*1000, total: 1000});

        // console.log(tAxis);
        if(mAxis === 59) {
          hAxis++;
          mAxis=0;
        }
        else {
          mAxis++;
        }

        if (Object.keys(data).length === 20) data.shift();

        redraw(data, "#sensor-mem-area-d3", sca.getOpt()['x'], sca.getOpt()['y'], sca.getOpt()['xAxis'], sca.getSvg()['svg'], sca.getSvg()['area'], sca.getSvg()['path'], sca.getSvg()['points'], sca.getOpt()['height'], 8);
      }, 3500);
    },
    displayDocker: function () {
      var self = this;

      var data = [
        {time:'10:00', area1:15.1, area2: 13, area3: 2, area4: 3, area5: 10, area6: 8, area7: 4, area8: 5, area9: 6, area10: 11, area11:1, area12: 15, area13: 7, area14: 9, area15: 12, area16: 18, area17: 16, area18: 19, area19: 2, area20: 16 },
        {time:'10:01', area1:15.1, area2: 13, area3: 2, area4: 3, area5: 10, area6: 8, area7: 3, area8: 2, area9: 2, area10: 8, area11:14, area12: 13, area13: 12, area14: 3, area15: 10, area16: 18, area17: 3, area18: 2, area19: 2, area20: 16 },
        {time:'10:02', area1:15.1, area2: 13, area3: 2, area4: 3, area5: 10, area6: 8, area7: 3, area8: 2, area9: 2, area10: 8, area11:14, area12: 13, area13: 12, area14: 3, area15: 10, area16: 18, area17: 3, area18: 2, area19: 2, area20: 16 },
        {time:'10:03', area1:15.1, area2: 13, area3: 2, area4: 3, area5: 10, area6: 8, area7: 3, area8: 2, area9: 2, area10: 8, area11:14, area12: 13, area13: 12, area14: 3, area15: 10, area16: 18, area17: 3, area18: 2, area19: 2, area20: 16 },
        {time:'10:04', area1:15.1, area2: 13, area3: 2, area4: 3, area5: 10, area6: 8, area7: 3, area8: 2, area9: 2, area10: 8, area11:14, area12: 13, area13: 12, area14: 3, area15: 10, area16: 18, area17: 3, area18: 2, area19: 2, area20: 16 },
        {time:'10:05', area1:14, area2: 13, area3: 2, area4: 3, area5: 10, area6: 8, area7: 3, area8: 2, area9: 2, area10: 8, area11:14, area12: 13, area13: 12, area14: 3, area15: 10, area16: 18, area17: 3, area18: 2, area19: 2, area20: 16 },
        {time:'10:06', area1:14, area2: 13, area3: 2, area4: 3, area5: 10, area6: 8, area7: 3, area8: 2, area9: 2, area10: 8, area11:14, area12: 13, area13: 12, area14: 3, area15: 10, area16: 18, area17: 3, area18: 2, area19: 2, area20: 16 },
        {time:'10:07', area1:14, area2: 13, area3: 2, area4: 3, area5: 10, area6: 8, area7: 3, area8: 2, area9: 2, area10: 8, area11:14, area12: 13, area13: 12, area14: 3, area15: 10, area16: 18, area17: 3, area18: 2, area19: 2, area20: 16 },
        {time:'10:08', area1:14, area2: 13, area3: 2, area4: 3, area5: 10, area6: 8, area7: 3, area8: 2, area9: 2, area10: 8, area11:14, area12: 13, area13: 12, area14: 3, area15: 10, area16: 18, area17: 3, area18: 2, area19: 2, area20: 16 }
      ];

      var hAxis = 10, mAxis = 9;

      //generation function
      function generate(data, id, axisNum) {
        var margin = {top: 14, right: 20, bottom: 60, left: 30},
            width = $(id).width() - margin.left - margin.right,
            height = $(id).height() - margin.top - margin.bottom;

        var parseDate = d3.time.format("%H:%M").parse;
        
        var legendSize = Math.floor(width / 27.5),
            color = d3.scale.category20();

        var x = d3.time.scale().range([0, width]),
            y = d3.scale.linear().rangeRound([height, 0]);

        //the radius of circle can be adjustable
        var r = d3.scale.linear()
            .domain([0, 20])
            .range([0, width / 45]);

        //deal with the datum, and store them into ddata
        var ddata = [];
        data.forEach(function(d) {
          for(var i=1; i<Object.keys(d).length; i++) {
            ddata.push({
              'time': parseDate(d['time']), 'area': self.scatterCategory[i-1], 'num': d['area'+i]
            });
          }
        });

        x.domain( d3.extent(ddata, function(d) { return d['time']; }) );
        y.domain([0,22]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(d3.time.minutes, Math.floor(data.length / axisNum))
            .tickPadding([6])
            .tickSize(-height);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(10)
            .tickPadding([8])
            .tickSize(-width);

        d3.select('#svg-docker').remove();

        var svg = d3.select(id).append("svg")
            .attr('id', "#svg-docker")
            .attr("width", width+margin.left+margin.right)
            .attr("height", height+margin.top+margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
            .attr("class", "x axis")
            .attr("id", "docker-x-axis")
            .attr("transform", "translate(0, " + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        var dots = svg.append("g")
            .attr("class", "scatter_dots");

        dots.selectAll(".scatter_circle")
            .data(ddata)
            .enter()
            .append("circle")
            .attr("class", function (d) { return "scatter_circle scatter_circle_" + d['area']; })
            .attr("cx", function (d) { return x(d['time']); })
            .attr("cy", function (d) { return y(d['num']); })
            .attr("r", function (d) { return r(10); })
            .style("display", function (d) {
              //to check if the checkbox has been selected and decide whether to show it out
              //use display:none and display:inherit to control the display of scatter dots
              if ($("#"+d['area']).prop("checked"))
                return 'inherit';
              else
                return 'none';
            })
            .style("fill", function (d) { return color(d['area']) })
            .on("mouseover", function (d) {
              if ($("#"+d['area']).prop("checked")) {
                $(this).tooltip({
                  'container': 'body',
                  'placement': 'left',
                  'title': d["area"] + " | " +d['num'],
                  'trigger': 'hover'
                })
                    .tooltip('show');
              }
            })
            .on("mouseout", function(d) {
              $(this).tooltip('destroy');
            });

        d3.selectAll('.scatter_legend').remove();

        var legend = svg.append('g')
            .attr('class', 'scatter_legend');

        var singLegend = legend.selectAll('.docker_legend')
            .data(self.selectScaCate)
            .enter()
            .append('g')
            .attr('class', 'docker_legend')
            .attr('transform', function(d, i) {
              return 'translate(' + ((5 + (width-20) / 5) * i + 5) + ',' + (height + margin.bottom - legendSize - 15) + ')';
            });

        singLegend.append('g:rect')
            .attr('width', legendSize)
            .attr('height', legendSize)
            .style('fill', function(d) {
              return color(d);
            });

        singLegend.append('g:text')
            .attr('x', legendSize*1.4)
            .attr('y', legendSize/1.3)
            .attr('font-size', function() {
              if ($(id).width() > 415)
                return '.9em';
              else {
                return '.55em';
              }
            })
            .text(function(d) {
              return d;
            });

        //draw the rect for legends
        var rect = svg.append('g')
            .attr("class", 'legendOuter');

        rect.selectAll('.legendRect')
            .data(self.selectScaCate)
            .enter()
            .append('rect')
            .attr('class', 'legendRect')
            .attr('width', (width - 20) / 5)
            .attr('height', legendSize + 10)
            .attr('transform', function(d, i) {
              return 'translate(' + (i * (5 + (width-20) / 5)) + ',' + (height + margin.bottom - legendSize - 20) + ')';
            });

        this.getOpt = function() {
          var axisOpt = new Object();
          axisOpt['x'] = x;
          axisOpt['xAxis'] = xAxis;
          axisOpt['y'] = y;
          axisOpt['r'] = r;
          axisOpt['legendSize'] = legendSize;
          axisOpt['height'] = height;
          axisOpt['width'] = width;
          axisOpt['margin'] = margin;

          return axisOpt;
        }

        this.getSvg = function() {
          var svgD = new Object();
          svgD['svg'] = svg;
          svgD['dots'] = dots;
          svgD['color'] = color;
          svgD['legend'] = legend
          svgD['rect'] = rect;

          return svgD;
        }
      }

      //redraw function
      function redraw(data, id, svg, dots, color, x, xAxis, y, r, init, axisNum) {
        //update the axis
        var parseDate = d3.time.format("%H:%M").parse;

        //parse the data
        var ddata = [];
        data.forEach(function(d) {
          for(var i=1; i<Object.keys(d).length; i++) {
            ddata.push({
              'time': parseDate(d['time']),
              'area': self.scatterCategory[i-1],
              'num': d['area'+i]
            });
          }
        });

        x.domain( d3.extent(ddata, function(d) { return d['time']; }) );
        xAxis.ticks(d3.time.minutes, Math.floor(data.length / axisNum));

        //update the axis
        svg.select("#docker-x-axis")
            .transition()
            .duration(200)
            .ease("sin-in-out")
            .call(xAxis);

        //update the dot
        dots.selectAll(".scatter_circle")
            .data(ddata)
            .transition()
            .duration(200)
            .attr("cx", function (d) {
              return x(d['time']);
            })
            .style("display", function (d) {
              //to check if the checkbox has been selected and decide whether to show it out
              //use display:none and display:inherit to control the display of scatter dots
              if ($("#"+d['area']).prop("checked"))
                return 'inherit';
              else
                return 'none';
            });
        //////////////////////////

        //draw new dot
        dots.selectAll(".scatter_circle")
            .data(ddata)
            .enter()
            .append("circle")
            .attr("class", function (d) { return "scatter_circle scatter_circle_" + d['area']; })
            .attr("cx", function (d) { return x(d['time']); })
            .attr("cy", function (d) { return y(d['num']); })
            .attr("r", function (d) { return r(10); })
            .style("display", function (d) {
              //to check if the checkbox has been selected and decide whether to show it out
              //use display:none and display:inherit to control the display of scatter dots
              if ($("#"+d['area']).prop("checked"))
                return 'inherit';
              else
                return 'none';
            })
            .style("fill", function (d) { return color(d['area']) })
            .on("mouseover", function (d) {
              if ($("#"+d['area']).prop("checked")) {
                $(this).tooltip({
                  'container': 'body',
                  'placement': 'left',
                  'title': d["area"] + " | " +d['num'],
                  'trigger': 'hover'
                })
                    .tooltip('show');
              }
            })
            .on("mouseout", function(d) {
              $(this).tooltip('destroy');
            });

        //remove old dot
        dots.selectAll(".scatter_circle")
            .data(ddata)
            .exit()
            .transition()
            .duration(500)
            .remove();

        //redraw legend
        self.legendRedraw(self.selectScaCate, id, init.getSvg()['legend'], init.getSvg()['rect'], init.getOpt()['legendSize'], init.getOpt()['margin'], init.getOpt()['height'], init.getOpt()['width'], init.getSvg()['color']);
      }

      //inits chart
      self.sensorDockerFunc = new generate(data, "#sensor-docker-scatterplot-d3", 5);

      //dynamic data and chart update
      setInterval(function() {
        //update donut data
        data.push({
          time: hAxis + ":" + mAxis,
          area1: Math.floor(Math.random()*20*0.5),
          area2: Math.floor(Math.random()*20*0.5),
          area3: Math.floor(Math.random()*20*0.5),
          area4: Math.floor(Math.random()*20*0.5),
          area5: Math.floor(Math.random()*20*0.5),
          area6: Math.floor(Math.random()*20*0.5),
          area7: Math.floor(Math.random()*20*0.5),
          area8: Math.floor(Math.random()*20*0.5),
          area9: Math.floor(Math.random()*20*0.5),
          area10: Math.floor(Math.random()*20*0.5),
          area11: Math.floor(Math.random()*20*0.5),
          area12: Math.floor(Math.random()*20*0.5),
          area13: Math.floor(Math.random()*20*0.5),
          area14: Math.floor(Math.random()*20*0.5),
          area15: Math.floor(Math.random()*20*0.5),
          area16: Math.floor(Math.random()*20*0.5),
          area17: Math.floor(Math.random()*20*0.5),
          area18: Math.floor(Math.random()*20*0.5),
          area19: Math.floor(Math.random()*20*0.5),
          area20: Math.floor(Math.random()*20*0.5)
        });

        if(mAxis === 59) {
          hAxis++;
          mAxis=0;
        }
        else {
          mAxis++;
        }

        if (Object.keys(data).length === 15) data.shift();

        redraw(data, "#sensor-docker-scatterplot-d3", self.sensorDockerFunc.getSvg()['svg'], self.sensorDockerFunc.getSvg()['dots'], self.sensorDockerFunc.getSvg()['color'], self.sensorDockerFunc.getOpt()['x'], self.sensorDockerFunc.getOpt()['xAxis'], self.sensorDockerFunc.getOpt()['y'], self.sensorDockerFunc.getOpt()['r'], self.sensorDockerFunc, 5);
      }, 6000);
    },
    displayCPU: function () {
      var data = [
        { inits: 'Bus', value: 10 },
        { inits: 'Tube', value: 100 },
        { inits: 'Train', value: 60 },
        { inits: 'Taxi', value: 10 },
        { inits: 'Walk', value: 80 },
        { inits: 'Cycle', value: 10 }
      ];

      var category = ['Bus', 'Tube', 'Train', 'Taxi', 'Walk', 'Cycle'];
         cateColor = ["#fff799", "#ffee00" , "#0068b7", '#00b7ee', '#a5d4f3', '#eff9ff'];
       
      //generation function
      function generate(data, id) {
        var margin = {top: 20, right: 0, bottom: 40, left: 0},
            width = $(id).width() - margin.left - margin.right,
            height = $(id).height() - margin.top - margin.bottom;

        var radius = Math.min(width, height) / 2,
            innerRadius = radius * 0.25,
            outerRadius = radius * 0.75;

        var legendRectSize = radius/8,
            legendSpacing = radius/5;

        var color = d3.scale.ordinal()
            .domain(category)
            .range(cateColor);

        var formatPercent = d3.format(".00%");

        var pie = d3.layout.pie()
            .value(function(d) {return d.value; })
            .sort(null);

        var arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        var svgX = (width+margin.right+margin.left) / 2,
            svgY = (radius*2 + margin.top*2) / 2;

        var svg = d3.select(id).append("svg")
            .attr("width", width+margin.right+margin.left)
            .attr("height", height+margin.top+margin.bottom)
            .append("g")
            .attr("transform", "translate(" + svgX + "," + svgY + ")");

        path = svg.datum(data).selectAll(".solidArc")
            .data(pie)
            .enter()
            .append("path")
            .attr("fill", function(d) {
              return color(d.data.inits);
            })
            .attr("class", "solidArc")
            .attr("stroke", "none")
            .attr("d", arc)
            .each(function(d) {
              this._current=d;
            })
            .on('mouseover', function(d) {
              console.log(d);

              d3.select(this).transition().duration(200).attr("d", arc.innerRadius(innerRadius).outerRadius(outerRadius / 0.75 * 0.9));

              //count the sum
              var count = 0;
              for (var i = 0; i < category.length; i++) {
                count += data[i]['value'];
              }

              svg.append("svg:text")
                  .attr("class", "donutCenterText")
                  .attr("dy", "-.3em")
                  .attr("text-anchor", "middle")
                  .transition().duration(200)
                  .text(d['data']['inits']);

              svg.append("svg:text")
                  .attr("class", "donutCenterText")
                  .attr("dy", ".8em")
                  .attr("text-anchor", "middle")
                  .transition().duration(200)
                  .text(formatPercent(d['value'] / count));

            })
            .on('mouseout', function(d) {
              d3.select(this).transition().duration(200).attr("d", arc.innerRadius(innerRadius).outerRadius(outerRadius));

              d3.selectAll('.donutCenterText').remove();
            });

        //legend rendering
        var legend = svg.selectAll('.legend')
            .data(color.domain())
            .enter()
            .append('g')
            .attr("id", function(d) {
              return "legend-" + d;
            })
            .attr('class', 'legend')
            .attr('transform', function(d, i) {
              var horz = (i-2.8)*(legendSpacing+legendRectSize);
              var vert =  radius + margin.bottom / 4;
              return 'translate(' + horz + ',' + vert + ')';
            });

        legend.append('rect')
            .attr('width', legendRectSize)
            .attr('height', legendRectSize)
            .style('fill', color)
            .style('stroke', color);

        legend.append('text')
            .data(data)
            .attr('x', legendRectSize*0.1)
            .attr('y', legendRectSize*1.4)
            //.attr('font-size', '.8em')
            .text(function(d) {
              //console.log(d);
              return d.inits; });

        this.getPath = function() {
          return path;
        }

        this.getArc = function() {
          return d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius);
        }
      }

      //redraw function
      function redraw(data, path, arc) {
        //for the transition effect of donut chart
        var arcTween = function arcTween(a) {
          var i = d3.interpolate(this._current, a);
          this._current = i(0);
          return function(t) {
            return arc(i(t));
          };
        }

        var donut = d3.layout.pie()
            .value(function(d) {return d.value; })
            .sort(null);

        donut.value(function(d) { return d['value']; });
        path = path.datum(data).data(donut).attr("d", arc); // compute the new angles
        path.transition().duration(750).attrTween("d", arcTween);
      }

      //inits chart
      var sca = new generate(data, "#sensor-cpu-donut-d3");

      //dynamic data and chart update
      setInterval(function() {
        //update donut data
        for (var i=0; i<Object.keys(data).length; i++){
          data[i].value = Math.floor(Math.random()*100);
        }

        redraw(data, sca.getPath(), sca.getArc());
      }, 5000);
    },
    checkOpt: function (e) {
      var self = this;

      //check the Scatter Choice and Refresh the charts
      var count = 0;
      for (var i=0; i < self.scatterCategory.length; i++) {
        if ($("#" + self.scatterCategory[i]).prop("checked"))
          count++;
      }

      //judge if the checked checkbox reach the max limitation
      if (count>5) {
        alert("NOTICE: The MAXIMUM selection should be FIVE.");
        e.target.checked = false;
      }

      self.selectScaCate = [];

      for (var i=0; i<self.scatterCategory.length; i++) {
        if ($("#"+self.scatterCategory[i]).prop("checked")) {
          self.selectScaCate.push(self.scatterCategory[i]);
          d3.selectAll(".scatter_circle_"+self.scatterCategory[i]).transition().duration(300).style("display", 'inherit');
        }
        else
          d3.selectAll(".scatter_circle_"+self.scatterCategory[i]).transition().duration(300).style("display", 'none');
      }

      //redraw the legend and chart
      this.legendRedraw(self.selectScaCate, "#sensor-docker-scatterplot-d3", self.sensorDockerFunc.getSvg()['legend'], self.sensorDockerFunc.getSvg()['rect'], self.sensorDockerFunc.getOpt()['legendSize'], self.sensorDockerFunc.getOpt()['margin'], self.sensorDockerFunc.getOpt()['height'], self.sensorDockerFunc.getOpt()['width'], self.sensorDockerFunc.getSvg()['color']);
    },
    legendRedraw: function (selectCate, id, legend, rect, legendSize, margin, height, width, color) {
      //update the scatter plot legend
      legend.selectAll('.docker_legend')
          .data(selectCate)
        // .transition()
        // .duration(200)
          .attr('transform', function(d, i) {
            return 'translate(' + ((5 + (width-20) / 5) * i + 5) + ',' + (height + margin.bottom - legendSize - 15) + ')';
          })

      legend.selectAll('rect')
          .data(selectCate)
          .style('fill', function(d) {
            return color(d);
          });

      legend.selectAll('text')
          .data(selectCate)
          .attr('x', legendSize*1.4)
          .attr('y', legendSize/1.3)
          .attr('font-size', function() {
            if ($(id).width() > 415)
              return '.9em';
            else {
              return '.55em';
            }
          })
          .text(function(d) {
            return d;
          });

      //create new legends
      var singLegend = legend.selectAll('.docker_legend')
          .data(selectCate)
          .enter()
          .append('g')
          .attr('class', 'docker_legend')
          .attr('transform', function(d, i) {
            return 'translate(' + ((5 + (width-20) / 5) * i + 5) + ',' + (height + margin.bottom - legendSize - 15) + ')';
          });

      singLegend.append('rect')
          .attr('width', legendSize)
          .attr('height', legendSize)
          .style('fill', function(d) {
            return color(d);
          });

      singLegend.append('text')
          .attr('x', legendSize*1.4)
          .attr('y', legendSize/1.3)
          .attr('font-size', function() {
            if ($(id).width() > 415)
              return '.9em';
            else {
              return '.55em';
            }
          })
          .text(function(d) {
            return d;
          });

      //remove the old legends
      legend.selectAll('.docker_legend')
          .data(selectCate)
          .exit()
          .remove();

      //redraw the rect around the legend
      rect.selectAll('.legendRect')
          .data(selectCate)
          .attr('transform', function(d, i) {
            return 'translate(' + ((5 + (width-20) / 5) * i) + ',' + (height + margin.bottom - legendSize - 20) + ')';
          });

      rect.selectAll('.legendRect')
          .data(selectCate)
          .enter()
          .append('rect')
          .attr('class', 'legendRect')
          .attr('width', (width - 20) / 5)
          .attr('height', legendSize + 10)
          .attr('transform', function(d, i) {
            return 'translate(' + ((5 + (width-20) / 5) * i) + ',' + (height + margin.bottom - legendSize - 20) + ')';
          });

      rect.selectAll('.legendRect')
          .data(selectCate)
          .exit()
          .remove();
    }
  },
  compiled: function () {
    var self = this;

    self.displayMem();
    self.displayDocker();
    self.displayCPU();
    

    setInterval(function () {
      self.people_count = Math.round( Math.random() * 0.03 * 100 * Math.pow(10,1))/Math.pow(10,1);

      //console.log("date",parseYear("2007"));
    }, 2000);
  }
});