var d3 = require('d3');

function BarChart(id, data, options) {
    var cfg = {
        w: 500,                //Width of the circle
        h: 500,                //Height of the circle
        margin: 10,            //The margins of the SVG
        layout: false,
        color: d3.scale.category10()   //Color function
    };

    //Put all of the options into a variable called cfg
    if ('undefined' !== typeof options) {
        for (var i in options) {
            if('undefined' !== typeof options[i]) { 
                cfg[i] = options[i]; 
            }
        }//for i
    }//if

    function barStack(d) {
        var l = d[0].length
        while (l--) {
            var posBase = 0, negBase = 0;
            d.forEach(function(d) {
                d=d[l]
                d.size = Math.abs(d.y)
                if (d.y<0)  {
                    d.y0 = negBase
                    negBase-=d.size
                } else
                {
                    d.y0 = posBase = posBase + d.size
                }
            })
        }
        d.extent= d3.extent(d3.merge(d3.merge(d.map(function(e) { return e.map(function(f) { return [f.y0,f.y0-f.size]})}))))
        return d
    }

    var  h=cfg.h
        ,w=cfg.w
        ,margin=cfg.margin
        ,color = cfg.color

        ,x = d3.scale.ordinal()
            .domain(d3.range(data[0].length+1))
            .rangeRoundBands([margin,w-margin], .1)

        ,y = d3.scale.linear()
            .range([h-margin,0+margin])

        ,xAxis = d3.svg.axis().scale(x).orient("bottom").tickSize(6, 0)
        ,yAxis = d3.svg.axis().scale(y).orient("left")

    barStack(data)
    y.domain(data.extent)


    svg = d3.select("body")
        .append("svg")
        .attr("height",h)
        .attr("width",w)

    svg.selectAll(".series").data(data)
        .enter().append("g").classed("series",true).style("fill", function(d,i) { return color(i)})
            .selectAll("rect").data(Object)
            .enter().append("rect")

    svg.append("g").attr("class","axis x")
    svg.append("g").attr("class","axis y")


    var layout = 0,dur=0
    redraw()
    dur = 1500


    function redraw() {
        if (layout=!layout) {
            /* Readjust the range to witdh and height */
            x.rangeRoundBands([margin,w-margin], .1)
            y.range([h-margin,0+margin])

            /* Reposition and redraw axis */
            svg.select(".x.axis")
                .transition().duration(dur)
                .attr("transform","translate (0 "+y(0)+")")
                .call(xAxis.orient("bottom"))
            svg.select(".y.axis")
                .transition().duration(dur)
                .attr("transform","translate ("+x(0)+" 0)")
                .call(yAxis.orient("left"))

            /* Reposition the elements */
            svg.selectAll(".series rect")
                .transition().duration(dur)
                .attr("x",function(d,i) { return x(d.x)})
                .attr("y",function(d) { return y(d.y0)})
                .attr("height",function(d) { return y(0)-y(d.size)})
                .attr("width",x.rangeBand())

        } else {
            /* Readjust the range to witdh and height */
            x.rangeRoundBands([h-margin,0+margin], .1)
            y.range([margin,w-margin])

            /* Reposition and redraw axis */
            svg.select(".x.axis")
                .transition().duration(dur)
                .attr("transform","translate ("+y(0)+" 0)")
                .call(xAxis.orient("left"))
            svg.select(".y.axis")
                .transition().duration(dur)
                .attr("transform","translate (0 "+x(0)+")")
                .call(yAxis.orient("bottom"))

            /* Reposition the elements */
            svg.selectAll(".series rect")
                .transition().duration(dur)
                .attr("y",function(d,i) { return x(d.x)})
                .attr("x",function(d) { return y(d.y0-d.size)})
                .attr("width",function(d) { return y(d.size)-y(0)})
                .attr("height",x.rangeBand())

        }

    if (cfg.layout) {
        d3.select("body").append("button")
            .attr("type","button")
            .text("Change Layout")
            .style("position","absolute")
            .style("left","5px")
            .style("top","5px")
            .on("click",redraw)
        }
    }

}

module.exports = BarChart;

