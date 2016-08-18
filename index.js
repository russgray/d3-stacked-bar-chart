var d3 = require('d3');

function BarChart(id, data, options) {
    var cfg = {
        w: 500,                         //Width
        h: 500,                         //Height
        margin: 20,                     //Margins of the SVG
        color: d3.scale.category10(),   //Color function
        labels: d3.range(data[0].length),
        tickFilter: function (d, i) {   //Which labels to include
            return true;
        },
        tickFormat: null,               //Label format
        tooltips: false                 //Show tooltips
    };

    // Put all of the options into a variable called cfg
    if ('undefined' !== typeof options) {
        for (var i in options) {
            if('undefined' !== typeof options[i]) {
                cfg[i] = options[i];
            }
        }
    }

    function barStack(seriesData) {
        var l = seriesData[0].length;
        while (l--) {
            var posBase = 0; // positive base
            var negBase = 0; // negative base

            seriesData.forEach(function(d) {
                d = d[l];
                d.size = Math.abs(d.y);
                if (d.y < 0) {
                    d.y0 = negBase;
                    negBase -= d.size;
                } else {
                    d.y0 = posBase = posBase + d.size;
                }
            });
        }
        seriesData.extent = d3.extent(
            d3.merge(
                d3.merge(
                    seriesData.map(function(e) {
                        return e.map(function(f) {
                            return [Math.ceil(f.y0), Math.floor(f.y0 - f.size)];
                        });
                    })
                )
            )
        );
        console.log('extent: ' + seriesData.extent);
    }

    var h = cfg.h;
    var w = cfg.w;
    var margin = cfg.margin;
    var color = cfg.color;
    var labels = cfg.labels;

    var x = d3.scale.ordinal()
        .domain(labels)
        .rangeRoundBands([margin, w - margin], .1);

    var y = d3.scale.linear()
        .range([h-margin, 0+margin]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickValues(x.domain().filter(cfg.tickFilter))
        .tickSize(6, 0);

    if (cfg.tickFormat) {
        xAxis.tickFormat(cfg.tickFormat);
    }

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    barStack(data);
    y.domain(data.extent);

    svg = d3.select(id)
        .append("svg")
        .attr("height", h)
        .attr("width", w);

    svg.selectAll(".series")
        .data(data)
        .enter()
        .append("g")
        .classed("series", true)
        .style("fill", function(d,i) { return color(i); })
        .style("opacity", 0.8)
            .selectAll("rect")
            .data(Object)
            .enter()
            .append("rect")
                .attr("x", function(d, i) { return x(x.domain()[i]); })
                .attr("y", function(d) { return y(d.y0); })
                .attr("height", function(d) { return y(0) - y(d.size); })
                .attr("width", x.rangeBand())
                .on("mouseover", function() { if (cfg.tooltips) { tooltip.style("display", null); } })
            .on("mouseout", function() {
                if (cfg.tooltips) { tooltip.style("display", "none") };
            })
            .on("mousemove", function(d) {
                if (cfg.tooltips) {
                    var xPosition = d3.mouse(this)[0] - 35;
                    var yPosition = d3.mouse(this)[1] - 5;
                    tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
                    tooltip.select("text").text(d.y);
                }
            });

    svg.append("g")
        .attr("class", "axis x")
        .attr("transform", "translate(0 " + y(0) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis y")
        .attr("transform", "translate(" + margin + " 0)")
        .call(yAxis);

    /* Here we add tooltips */
    if (cfg.tooltips) {
        // Prep the tooltip bits, initial display is hidden
        var tooltip = svg.append("g")
            .attr("class", "tooltip")
            .style("display", "none");

        tooltip.append("rect")
            .attr("width", 40)
            .attr("height", 30)
            .attr("fill", "white")
            .style("opacity", 0.5);

        tooltip.append("text")
            .attr("x", 20)
            .attr("dy", "1.5em")
            .style("text-anchor", "middle")
            .attr("font-size", "12px")
            .attr("font-weight", "bold");
    }
}

module.exports = BarChart;

