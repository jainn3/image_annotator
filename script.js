class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Line {
    constructor(x, y) {
        this.pt1 = x;
        this.pt2 = y;
    }
}

var lastX = 0,
    lastY = 0;

//.style("border", "15px solid black");
max = {
    x: 800,
    y: 600
},
imgUrl = "img.jpg";
height = max.y;
width = max.x;
div = null;
var line, isDown = false,
    lDown = false,
    isDragging = false,
    isResize = false,
    m1, m2, width = 800,
    height = 600;

vis = null;
var _scale = 1;
createloadsvg();
function createloadsvg()
{
    //no mouse click event on svg. why mouse click on svg when you have rects.
    vis = d3.select("body").append("svg")
    .on("click", wrappercreateGrid)
    .on("mousemove", mousemove)
    .attr("viewBox", "0 0 800 600")
    .attr("width", "800")
    .attr("height", "600")
    .call(d3.behavior.zoom().on("zoom", function () {
        var mode = document.getElementById('mode').value;
        if (mode == "Z" || true)
        {     
            svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")");


            d3.selectAll("line").style("stroke-width",3/d3.event.scale);
            d3.selectAll("rect").style("stroke-width",3/d3.event.scale);
            _scale = d3.event.scale;
            //cssChilds = document.styleSheets[0].cssText = "line {stroke-width : " + 3/d3.event.scale + ";}";
            /*
            rects = document.getElementsByTagName("rect");
            for(var i=0; i<rects.length; i++)
                rects[i].style.strokeWidth = 3/d3.event.scale;
            lines = document.getElementsByTagName("line");
             for(var i=0; i<lines.length; i++)
                lines[i].style.strokeWidth = 3/d3.event.scale;
                */
            
        }
            }))
    .on("dblclick.zoom", null) 
    .append("g");
//.style("border", "15px solid black");
    
    vis.append("defs")
    .append("pattern")
    .attr("id", "venus")
    .attr('patternUnits', 'userSpaceOnUse')
    .attr("width", max.x)
    .attr("height", max.y)
    .append("image")
    .attr("xlink:href", imgUrl)
    .attr("width", max.x)
    .attr("height", max.y);
    
d3.select("defs").append("marker")
    .attr("id", "triangle")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 7)
    .attr("refY", 0)
    .attr("markerWidth", 10)
    .attr("markerHeight", 8)
    .attr("orient", "auto")
    .attr("markerUnits", "userSpaceOnUse")
   // .style("opacity","0.2")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5");
    
vis.append("rect")
    .attr("x", "0")
    .attr("y", "0")
    .attr("width", max.x)
    .attr("height", max.y)
    .attr("fill", "url(#venus)");
    
    // Add cross hairs and floating value on axis
var svg = vis;
createCrossHair(svg, width, height);
    
 div = d3.select("body")
	.append("div")  // declare the tooltip div 
	.attr("class", "tooltip")              // apply the 'tooltip' class
	.style("opacity", 0); 
    
    /*
    div	.html("<a href='#' value='Up' name='up' onclick='tooltipOnClick(this)' style='visibility:hidden;'>Up </a>"
             +"<a href='#' value='Down' name='down' onclick='tooltipOnClick(this)' style='visibility:hidden;'>Down </a>"
             +"<a href='#' value='Left' name='left' onclick='tooltipOnClick(this)' style='visibility:hidden;'>Left </a>"
             +"<a href='#' value='Right' name='right' onclick='tooltipOnClick(this)' style='visibility:hidden;'>Right </a>"
             +"<a href='#' value='Clear' name='clear' onclick='tooltipOnClick(this)' style='visibility:hidden;'>Clear</a>"
             );
    */
    div	.html("<a href='#' value='select' name='select' onclick='tooltipOnClick(this)' style='display:none; text-decoration: none;'>select</a>"
             +"<a href='#' value='clear' name='clear' onclick='tooltipOnClick(this)' style='display:none; text-decoration: none;'>clr </a>"
             +"<a href='#' value='delete' name='delete' onclick='tooltipOnClick(this)' style='display:none; text-decoration: none;'>del</a>");
    
    
}


//dragstart for smooth drag of rectangle.
var drag = d3.behavior.drag().on("drag", dragmove).on("dragstart", function () {
d3.event.sourceEvent.stopPropagation();
    lastX = d3.event.sourceEvent.clientX;
    lastY = d3.event.sourceEvent.clientY;
    
})
.on("dragend", function () {
    d3.event.sourceEvent.stopPropagation();

    isDragging = isDown;
});

function dragmove() {
    d3.event.sourceEvent.stopPropagation();

    /*
    if(this.tagName == "rect")
    {
         isDragging = true;
            return;
    }
    */
    //NJ Don't want to move or drag or resize if Erase mode is set in.
    var mode = document.getElementById('mode').value;

    //moving rectangle
    if (this.tagName == "rect") {
        //only in create table mode. Bug. the rect is able to be moved outside the boundry. dont know why.
        if (mode == "CT") {
            //console.log(d3.event.sourceEvent.clientX);
            //console.log(d3.event.sourceEvent.clientY);

            var g = d3.select(this.parentNode);

            var t = d3.transform(g.attr("transform"))
            //var t = d3.transform(gelement.attributes.getNamedItem("transform")),
            // x = +t.translate[0] + +d3.event.dx,
            //y = +t.translate[1] + +d3.event.dy;

            transX = +t.translate[0] + d3.event.sourceEvent.clientX - lastX;
            transY = +t.translate[1] + d3.event.sourceEvent.clientY - lastY;
            //translate = d3.transform(g.getAttribute("transform")).translate;

            /*
            var svg1 = document.getElementsByTagName('svg')[0];
            var bBox = svg1.getBBox();
            console.log('XxY', bBox.x + 'x' + bBox.y);
            console.log('size', bBox.width + 'x' + bBox.height);

            console.log('client', svg1.clientWidth + 'x' + svg1.clientHeight);
            console.log(transX + " " + transY);
            */
            g.attr("transform", "translate(" + transX + "," + transY + ")");
            lastX = d3.event.sourceEvent.clientX;
            lastY = d3.event.sourceEvent.clientY;
            isDragging = true;
        }
        //return;
    }

    //moving lines
    else {
        //no dragging in Erase H or V mode.
        if (mode == "EH" || mode == "EV")
            return;

        var initialX1 = this.getAttribute("x1"),
            initialY1 = this.getAttribute("y1"),
            initialX2 = this.getAttribute("x2"),
            initialY2 = this.getAttribute("y2");

        if (isResize) {
            console.log('isResize');
        } else {

            var dx1, dx2, dy1, dy2;
            //if(initialY1 == initialY2) {
            if (Math.abs(initialY1 - initialY2) <= 5) {
                // If the line is horizontal only move along y_axis
                dx1 = 0;
                dx2 = 0;
                dy1 = d3.event.dy;
                dy2 = d3.event.dy;
                //} else if(initialX1 == initialX2) {
            } else if (Math.abs(initialX1 - initialX2) <= 5) {
                // If the line is vertical only move along x_axis
                dy1 = 0;
                dy2 = 0;
                dx1 = d3.event.dx;
                dx2 = d3.event.dx;
            }

            //move actual lines.
            //the value is +5 since there is a circle. This gets the width and height of encolsing rect. top, right, left, bottom, width, height
            //rememeber this gives wrt to windows. getBBox works like a charm.
            var crect = this.parentNode.getBoundingClientRect();
            //check = mytest.getCTM();
            //console.log("ctm" + mytest.getCTM());

            var currrect = d3.select(this.parentNode)[0][0].getBBox();


            //These are defined boundry so that line dragging doesn't go out of box.
            if (d3.select(this).attr("class") == "Horizontal") {
                minx = +currrect.x - 20;
                maxx = +currrect.x + +currrect.width - 5 + 20;
                miny = +currrect.y;
                maxy = +currrect.y + +currrect.height - 5;
            } else if (d3.select(this).attr("class") == "Vertical") {
                minx = +currrect.x;
                maxx = +currrect.x + +currrect.width - 5;
                miny = +currrect.y - 20;
                maxy = +currrect.y + +currrect.height - 5 + 20;
            }

            //add code to make sure the boundaries.
            if ((+initialX1 + dx1) > minx && (+initialX2 + dx2) < maxx && (+initialY1 + dy1) > miny && (+initialY2 + dy2) < maxy) {
                d3.select(this)
                    .attr("x1", +initialX1 + dx1)
                    .attr("y1", +initialY1 + dy1)
                    .attr("x2", +initialX2 + dx2)
                    .attr("y2", +initialY2 + dy2);
            }

            //moving all the lines which have been broken together
            //add code for vertical lines too.
            cid = d3.select(this).attr("name");
            //cid null means this is a normal red line. id cid is some unique id means lines is the broken one.
            //if stoke is some hes other than red than line is the broken one.
            isHorV = d3.select(this).attr("class");

            if (cid != null) {
                var allhlines = document.getElementsByName(cid);
                for (var i = 0; i < allhlines.length; i++) {
                    currline = allhlines[i];
                    if (isHorV == "Horizontal") {
                        d3.select(currline)
                            .attr("y1", this.getAttribute("y1"))
                            .attr("y2", this.getAttribute("y2"));
                    } else {
                        d3.select(currline)
                            .attr("x1", this.getAttribute("x1"))
                            .attr("x2", this.getAttribute("x2"));
                    }
                }
            }

            //moving the broken part.
            //add for horizontal as well
            if (isHorV == "Vertical") {
                var lines = this.parentNode.getElementsByClassName("Horizontal");
            } else {
                var lines = this.parentNode.getElementsByClassName("Vertical");
            }

            //var crect = this.parentNode.getBoundingClientRect();
            //crect doesn't seems to be working. the left and top values I get are 59 and  99 res

            //bug cannot extend them beyond booundry.
            for (var i = 0; i < lines.length; i++) {
                var currline = lines[i];
                if (isHorV == "Vertical") {

                    if (Math.abs(currline.getAttribute("x2") - initialX1) <= 5) {
                        // i dont want t move vertical and horizontal lines when they are moved to and from edges.

                        //this is when we drag lines from the end. Replace by min and max.
                        //revamp.
                        if ((+currline.getAttribute("x2") + dx2) < (+currrect.x + +currrect.width - 15) &&
                            (+currline.getAttribute("x2") + dx2) > (+currrect.x + 5)) {
                            d3.select(currline)
                                .attr("x2", +currline.getAttribute("x2") + dx2);
                        }
                    } else if (Math.abs(currline.getAttribute("x1") - initialX1) <= 5) {
                        if ((+currline.getAttribute("x1") + dx1) < (+currrect.x + +currrect.width - 15) &&
                            (+currline.getAttribute("x1") + dx1) > (+currrect.x + 5)) {
                            d3.select(currline)
                                .attr("x1", +currline.getAttribute("x1") + dx1);
                        }
                    }
                } else {
                    if (Math.abs(currline.getAttribute("y2") - initialY1) <= 5) {
                        // i dont want t move vertical and horizontal lines when they are moved to and from edges.
                        if ((+currline.getAttribute("y2") + dy2) < (+currrect.y + +currrect.height - 15) &&
                            (+currline.getAttribute("y2") + dy2) > (+currrect.y + 15)) {
                            d3.select(currline)
                                .attr("y2", +currline.getAttribute("y2") + dy2);
                        }
                    } else if (Math.abs(currline.getAttribute("y1") - initialY1) <= 5) {
                        if ((+currline.getAttribute("y1") + dy1) < (+currrect.y + +currrect.height - 15) &&
                            (+currline.getAttribute("y1") + dy1) > (+currrect.y + 15)) {
                            d3.select(currline)
                                .attr("y1", +currline.getAttribute("y1") + dy1);
                        }
                    }
                }

            }
        }
    }
}

function isMarkerClicked(_this)
{
   
    var m = d3.mouse(_this);
    rect = d3.select(_this.parentNode).select("rect");
    className = d3.select(_this).attr("class");
    if(className == "Horizontal")
    {
        if(m[0] > (+rect.attr("x") + +rect.attr("width")))
        {
            console.log("Marker clicked H");
            return true;
        }
    }
    
    if(className == "Vertical")
    {
        if(m[1] > (+rect.attr("y") + +rect.attr("height")))
        {
            console.log("Marker clicked V");
            return true;
        }
    }
    
    return false;
}

function changeStateOfLine(_this)
{
    className = d3.select(_this).attr("class");
    curr_style = d3.select(_this).style("stroke");


    if(rgb2hex(curr_style) == "#ff0000")
    {
        d3.select(_this).style("stroke", "green");
        name =  d3.select(_this).attr("name");
        if(name !=null)
        {
            simlines = document.getElementsByName(name);
            for(var i=0;i<simlines.length; i++)
                d3.select(simlines[i]).style("stroke","green");        
        }
    }
    else 
    {
        _this.removeAttribute('type');
        d3.select(_this).style("stroke", "red");
        name =  d3.select(_this).attr("name");
        if(name !=null)
        {
            simlines = document.getElementsByName(name);
            for(var i=0;i<simlines.length; i++)
                d3.select(simlines[i]).style("stroke","red");
        }
        return;
    }
    
        if(className == "Horizontal")
        {
            var element = _this.parentNode.querySelector('[type="down"]');
            
            if(element == null)
            {
                 element = _this.parentNode.querySelector('[type="up"]');
                if(element == null)
                    _this.setAttribute('type', "down");
                return;
            }
            
            if(_this.getAttribute("y1") < element.getAttribute("y1"))
                {
                        _this.setAttribute('type', "up");
                        element.setAttribute('type', "down");
                }
            else
                {
                        _this.setAttribute('type', "down");
                         element.setAttribute('type', "up");
                }
        }
        else if(className == "Vertical")
            {
                var element = _this.parentNode.querySelector('[type="left"]');
                if(element == null)
                {
                    element = _this.parentNode.querySelector('[type="right"]');
                    if(element == null)
                        _this.setAttribute('type', "left");
                    return;
                }
                if(_this.getAttribute("x1") < element.getAttribute("x1"))
                   {
                        _this.setAttribute('type', "left");
                        element.setAttribute('type', "right");
                   }
                else
                    {
                        _this.setAttribute('type', "right");
                         element.setAttribute('type', "left");
                    }
            }
        
    }
    
function deleteentireline(_this)
{
    var cname = d3.select(_this).attr("name");
    if (cname != null) {
        var lines = document.getElementsByName(cname);
        for (var i = 0; i < lines.length; i++) {
            lines[i].remove();
            }
        }
        _this.remove();
}
//this on click of each line. what happens:
// 1) Delete entire line
//   2) delete portion of the line
// 3) gets baack deleted portion.
// 4) select the line if clicked on markers.
//does not need line id. have to remove it.
//can you do it onclick.
function mousedown2() {
    if (d3.event.defaultPrevented) return;

    mode = document.getElementById('mode').value;

    marker = isMarkerClicked(this);
    if(marker)
    {
        if(true)
            return;
        changeStateOfLine(this);
    }
    if(marker)
        return;
    if (mode == "EL") {
            deleteentireline(this);
        return;
    }
    //no need of this. //remove it.
    //if (deleteEntireLines(this))
    //    return;

    isDragging = true;
    //revamp condition later.
    if (mode == "EH" || mode == "EV" || true) {

        //if(this.id == "deletedline") if you clicked by the deleted segement then get it back.
        if (rgb2hex(d3.select(this).style("stroke")) == "#d7e3fe") {
            d3.select(this)
            //.attr("id","")
                .style("stroke", "red")
                //.style("stroke-width", "3px")
                .style("opacity", "1.0");
                //.attr("marker-end", null);
            return;
        }

        var retvals = getIntersectingPoints(this);
        start = retvals[0];
        end = retvals[1];

        //link all the horizontal lines together.
        lineid = d3.select(this).attr("name");
        if (lineid == null)
            lineid = makeid();
        xc = this.getAttribute("x1");
        yc = this.getAttribute("y1");
        xc1 = this.getAttribute("x2");
        yc1 = this.getAttribute("y2");
        this.remove();

        var className = d3.select(this).attr("class");
        /*
        if (mode == "EH" || true)
            className = "Horizontal";
        else
            className = "Vertical";
            */

        //line one appended xc,yc to start and end to xc1,yc1
        if (className == "Horizontal") {
            addlines(currg, xc, start.x, yc, yc, lineid, className, null, null);
            addlines(currg, end.x, xc1, yc, yc, lineid, className, null, null);
            addlines(currg, start.x, end.x, yc, yc, lineid, className, "#d7e3fe", "3px", true);

        }
        if (className == "Vertical") {
            addlines(currg, xc, xc, yc, start.y, lineid, className, null, null);
            addlines(currg, xc, xc, end.y, yc1, lineid, className, null, null);
            addlines(currg, xc, xc, start.y, end.y, lineid, className, "#d7e3fe", "3px", true);
        }

        start = end = null;
    }
}

function mouseup(e) {
    isDragging = isDown = false;
    lDown = !lDown;
}

function greenLineCoordsV(_this, mode)
{
    var addmarker = true;
    var m = d3.mouse(_this);

    var up = _this.parentNode.querySelector('[type="up"]');
    var down = _this.parentNode.querySelector('[type="down"]');
                
                var _y1 =null, _y2 =null;
                
                //when line is drawn between 2 selected green line.
                if(up!=null && down!=null)
                {
                    _y1 = up.getAttribute("y1");
                    _y2 = down.getAttribute("y1");
                    addmarker = false;
                }
                //if there is only one green line. draw the line between broundaries.
                else if(up != null || down!=null)
                {
                    curr = up == null ? down : up;
                    if(m[1] < curr.getAttribute("y1"))
                    {
                        _y1 = d3.select(_this.parentNode).select("rect").attr("y");
                        _y2 = curr.getAttribute("y1");
                        addmarker = false;
                    }
                    else
                    {
                        _y2 = +d3.select(_this.parentNode).select("rect").attr("y") +                   +d3.select(_this.parentNode).select("rect").attr("height")+6;
                        _y1 = curr.getAttribute("y1");
                        addmarker = true;
                    }
                }
    
    return [_y1, _y2, addmarker];
}


function greenLineCoordsH(_this, mode)
{
    var addmarker = true;
    var m = d3.mouse(_this);
    var left = _this.parentNode.querySelector('[type="left"]');
    var right = _this.parentNode.querySelector('[type="right"]');
                var _x1 =null, _x2 =null;
                if(left!=null && right!=null)
                {
                    _x1 = left.getAttribute("x1");
                    _x2 = right.getAttribute("x1");
                    addmarker = false;
                }
                else if(left != null || right!=null)
                {
                    curr = left == null ? right : left;
                    if(m[0] < curr.getAttribute("x1"))
                    {
                        _x1 = d3.select(_this.parentNode).select("rect").attr("x");
                        _x2 = curr.getAttribute("x1");
                        addmarker = false;
                    }
                    else
                    {
                        _x2 = +d3.select(_this.parentNode).select("rect").attr("x") +                   +d3.select(_this.parentNode).select("rect").attr("width") +6;
                        _x1 = curr.getAttribute("x1");
                        addmarker = true;
                    }
                }
        return [_x1, _x2, addmarker];
    
}
//adding dynamically H and V lines and on mouse click event on each line which mousedown2 function.
//a. rect on click only. For svg on click we have different event handler.
//1. erase rect
//2. adds vertical and horizontal lines on mousedown.
function mousedown() {
    mode = document.getElementById('mode').value;

    if (mode == "ET") {
        this.parentNode.remove();
        return;
    }
    //adding a  table on click.
    //If create table mode is on mouse down should have no impact. return. No lines drawn on CT, EH, EV mode.
    if (mode == "CT" || mode == "EH" || mode == "EV") {
        return;
    }

    if(mode == "H" || mode == "V")
    {
        var addmarker = true;
    //this if is for line creation.
    if (!isDown && !isDragging || true) {
        if (mode == "V" || mode == "H") {
            var m = d3.mouse(this);
            lineid = null;
            if (mode == "V") {
                
                //I am getting coords for drawing lines between 2 green lines or one green line..
                var vals = greenLineCoordsV(this, "V");
                _y1 = vals[0];
                _y2 = vals[1];
                addmarker = vals[2];
                
                lineid = makeid();
            
                //upper m[0], rect.y
                //lower m[0], rect.y + 
                
                var x1 = m[0];
                var x2 = m[0];
                var y1 = _y1 == null ? +this.getAttribute("y") : _y1;
                var y2 = _y2 == null ? +this.getAttribute("y") + +this.getAttribute("height") + 6 : _y2;
                className = "Vertical";
                if(_y1 !=null || _y2 !=null)
                {
                    if(_y1!=null)
                    {
                        addlines(this.parentNode, m[0], x1, +this.getAttribute("y"), y1, lineid, "Vertical", "#d7e3fe", "3px",true);
                    }
                    if(_y2!=null)
                    {
                        addlines(this.parentNode, x2, m[0], y2, +this.getAttribute("y") + +this.getAttribute("height"), lineid, "Vertical", "#d7e3fe", "3px",true);
                 
                        addlines(this.parentNode, x2, m[0], +this.getAttribute("y") + +this.getAttribute("height"), +this.getAttribute("y") + +this.getAttribute("height") + 6, lineid, "Vertical", null, null,false, true);
                    }
                    
                }
                
            } else if (mode == "H") {
                
                lineid = makeid();
                var vals = greenLineCoordsH(this, "V");
                _x1 = vals[0];
                _x2 = vals[1];
                addmarker = vals[2];
                
                var x1 = _x1 == null ? +this.getAttribute("x") : _x1;
                var x2 = _x2 == null ? +this.getAttribute("x") + +this.getAttribute("width") + 6 : _x2;
                var y1 = m[1];
                var y2 = m[1];
                className = "Horizontal";
                
                if(_x1 !=null || _x2 !=null)
                {
                    if(_x1!=null)
                    {
                        addlines(this.parentNode, +this.getAttribute("x"), x1, m[1], y1, lineid, "Horizontal", "#d7e3fe", "3px",true);
                    }
                    if(_x2!=null)
                    {
                        addlines(this.parentNode, x2, +this.getAttribute("x") + +this.getAttribute("width"),  y2, m[1], lineid, "Horizontal", "#d7e3fe", "3px",true);
                 
                        addlines(this.parentNode,+this.getAttribute("x") + +this.getAttribute("width"), +this.getAttribute("x") + +this.getAttribute("width") + 6,  y2, m[1], lineid, "Horizontal", null, null,false, true);
                    }
                    
                }

            }
            //createNewLine(x1,y1, x2, y2, className);

            gparent = d3.select(this.parentNode);
            line = gparent.append("line")
                .attr("x1", x1)
                .attr("y1", y1)
                .attr("x2", x2)
                .attr("y2", y2)
                .attr("class", className)
            //.data([[6]])
            //moving horizontal and vertical lines.
                .call(drag);
            //important add.
            line.on("click", mousedown2);
            
            line.style("stroke-width", 3/_scale);
             
            if(addmarker)
                line.attr("marker-end","url(#triangle)");
            
             if(lineid !=null)
             {
                line.attr("id", lineid);
                line.attr("name", lineid);

             }
            
            line.on("mouseover", tooltip);
            line.on("mouseout", removeTooltip);

        }
    }

    //on click event is added here.
    else {
        isResize = false;
        lDown = !lDown;
        //important remove.
        //line.on("mousedown", mousedown2);
        if(line)
            line.on("mouseup", mouseup);

    }
    isDown = !isDown;
    isDragging = isDown;
    }
}

function mousemove() {
    if (isDown && !isDragging) {
        console.log("I am in mouse move");
        var m = d3.mouse(this);
        line.attr("x2", m[0])
            .attr("y2", m[1]);
    }
}

var dragC1 = d3.behavior.drag().on('drag', dragPoint).on("dragstart", function () {
d3.event.sourceEvent.stopPropagation();
});

function wrappercreateGrid()
{
    //revert this back.
    if (d3.event.defaultPrevented) return;
    createGrid(this);
}
//crreating a rectangle and 4 edge circle for resizing. start=(50,50) width=height=300, red-color 5px thickness.
function createGrid(_this = null) {
    mode = document.getElementById('mode').value;
    if (mode == "CT") {
        var m = d3.mouse(_this);
        //console.log(document.getElementsByTagName("svg")[0].firstElementChild.getCTM());
        ctm = document.getElementsByTagName("svg")[0].firstElementChild.getCTM();
        _x = (m[0] - ctm.e)/ctm.a;
        _y = (m[1] - ctm.f)/ ctm.d;
        var newg = vis.append("g")
        //.attr("id","firstg")
        .attr("class", "grouptable")
        .attr("cursor", "move")

        var dragrect = newg.append("rect")
        //.attr("x", function(d) { return 50; })
        //.attr("y", function(d) { return 50; })
        .attr("x",_x)
        .attr("y",_y)
        .attr("height", 100)
        .attr("width", 100)
        .style("stroke", "red")
        //.style("stroke-width", "3px")
        //.attr("cursor", "ns-resize")
        .attr("fill-opacity", "0.0")
        //this mouse down event to draw lines H and V
        .on("mousedown", mousedown)
        //this drag event is to move the rect.
        .call(drag);

         dragrect.style("stroke-width", 3/_scale);
        
        pointElement1 = newg.append('circle').attr('class', 'bottomright').attr('r', 5).attr('cx', _x+100).attr('cy', _y+100).call(dragC1);
        //manage resize. each black circle has unique classname to identify the location of the black circle.
        //needs implementation either a way to resize all group elements or individually resize.
        /*
                    pointElement2 = newg.append('circle').attr('class', 'leftbottom').attr('r', 5).attr('cx', 50).attr('cy', 350).call(dragC1); 
                    pointElement3 = newg.append('circle').attr('class', 'topright').attr('r', 5).attr('cx', 350).attr('cy', 50).call(dragC1);
                    pointElement4 = newg.append('circle').attr('class', 'topleft').attr('r', 5).attr('cx', 50).attr('cy', 50).call(dragC1);
                    */
    }
}

function clearLine(_this)
{
     _this.removeAttribute('type');
    d3.select(_this).style("stroke", "red");
    name =  d3.select(_this).attr("name");
    if(name !=null)
        {
            simlines = document.getElementsByName(name);
            for(var i=0;i<simlines.length; i++)
            {
                d3.select(simlines[i]).style("stroke","red");
                
                simlines[i].removeAttribute("type");
                simlines[i].removeAttribute("order");
            }
        }
}

function setLine(_this)
{
    d3.select(_this).style("stroke", "green");
        name =  d3.select(_this).attr("name");
        if(name !=null)
        {
            simlines = document.getElementsByName(name);
            for(var i=0;i<simlines.length; i++)
                d3.select(simlines[i]).style("stroke","green");        
        }
}
function settype(_this,type, order)
{
    name =  d3.select(_this).attr("name");
    if(name !=null)
        {
            simlines = document.getElementsByName(name);
            for(var i=0;i<simlines.length; i++)
            {
                d3.select(simlines[i]).attr("type",type);
            if(order)
                d3.select(simlines[i]).attr("order",order);
            }

        }
}
//This is current working.
function changeLineState(_this, name)
{
    className = d3.select(_this).attr("class");
    curr_style = d3.select(_this).style("stroke");
    
    if(name == "select")
    {
       setLine(_this);
    }
    else if(name == "clear")
    {
       clearLine(_this);
       return;
    }
    
        if(className == "Horizontal")
        {
            var downelement = _this.parentNode.querySelector('[type="down"]');
            var upelement = _this.parentNode.querySelector('[type="up"]');

            if(downelement == null)
            {
                if(upelement == null)
                {
                    _this.setAttribute('type', "down");
                    settype(_this,'down', null);

                }
                return;
            }
            var element = null;
            
            if(downelement!=null && upelement!=null)
            {
                if(d3.select(downelement).attr("order") == '1')
                {
                    element = upelement;
                    clearLine(downelement);
                }
                else 
                {
                    element = downelement;
                    clearLine(upelement);
                }
            }
            
            if(element==null)
                element = downelement != null? downelement : upelement;
            if(_this.getAttribute("y1") < element.getAttribute("y1"))
                {
                    _this.setAttribute('order','2');
                    element.setAttribute('order','1');
                    _this.setAttribute('type', "up");
                    element.setAttribute('type', "down");
                    settype(_this,'up', '2');
                    settype(element,'down', '1');
                }
            else
                {
                    _this.setAttribute('order','2');
                    element.setAttribute('order','1');
                    _this.setAttribute('type', "down");
                    element.setAttribute('type', "up");
                    settype(_this,'down', '2');
                    settype(element,'up', '1');
                }
        }
        else if(className == "Vertical")
            {
                var element = _this.parentNode.querySelector('[type="left"]');
                if(element == null)
                {
                    element = _this.parentNode.querySelector('[type="right"]');
                    if(element == null)
                        _this.setAttribute('type', "left");
                    return;
                }
                if(_this.getAttribute("x1") < element.getAttribute("x1"))
                   {
                        _this.setAttribute('type', "left");
                        element.setAttribute('type', "right");
                   }
                else
                    {
                        _this.setAttribute('type', "right");
                         element.setAttribute('type', "left");
                    }
            }
    
}

function tooltipOnClick(_this)
{
    
     // value stores the line.
    currlineName = d3.select(_this.parentNode).attr("value");
    state = _this.name;
    if(state == "delete")
    {
        deleteentireline(document.getElementsByName(currlineName)[0]);
    }
    else
    {
        changeLineState(document.getElementsByName(currlineName)[0], state);

    }
}

function removeTooltip()
{
    return;
    /*div.duration(5)
    .style("visibility","hidden");*/
}
function tooltip()
{		
    div.style("visibility","visible");
    console.log(this.getBoundingClientRect());
    currline = d3.select(this);
    coord = this.getBoundingClientRect();
    rect = this.parentNode.getBoundingClientRect();
    /*
      if(currline.attr("class") == "Horizontal")
      {
        left = coord.right;
        top = coord.top;
      }
    */
    var type = "None";
    className = currline.attr("class");
    otherType = null;
    /*
    document.getElementsByName("down")[0].style.visibility = document.getElementsByName("up")[0].style.visibility = document.getElementsByName("clear")[0].style.visibility = "hidden";
    document.getElementsByName("left")[0].style.visibility = document.getElementsByName("right")[0].style.visibility = document.getElementsByName("clear")[0].style.visibility = "hidden";
*/
    /*
    if(className == "Horizontal")
    {
               type = currline.attr("type");
               if(type != "down")
               {
                   document.getElementsByName("down")[0].style.visibility = "visible";
                    //div.select("down").style("visibility", "visible");
                                             
               }
               if(type != "up")
               {
                   document.getElementsByName("up")[0].style.visibility = "visible";
                   //div.select("up").style("visibility", "visible");
               }
               if(type!=null)
               {
                     document.getElementsByName("clear")[0].style.visibility = "visible";

                    //div.select("clear").style("visibility", "visible");
               }
        
    }
    else if(className == "Vertical")
    {
               type = currline.attr("type");
               if(type != "left")
               {
                   document.getElementsByName("left")[0].style.visibility = "visible";
                    //div.select("down").style("visibility", "visible");
                                             
               }
               if(type != "right")
               {
                   document.getElementsByName("right")[0].style.visibility = "visible";
                   //div.select("up").style("visibility", "visible");
               }
               if(type!=null)
               {
                     document.getElementsByName("clear")[0].style.visibility = "visible";

                    //div.select("clear").style("visibility", "visible");
               }       
    }
    
    */
    if(this.hasAttribute("type"))
    {
        document.getElementsByName("clear")[0].style.display = "inline";
        document.getElementsByName("select")[0].style.display = "none";
        document.getElementsByName("delete")[0].style.display = "inline";

    }
    else
    {
        document.getElementsByName("clear")[0].style.display = "none";
        document.getElementsByName("select")[0].style.display = "inline";
        document.getElementsByName("delete")[0].style.display = "none";
    }
    
    div.attr("value",currline.attr("name"));
    div.transition()
				.duration(500)	
				.style("opacity", 0);
			div.transition()
				.duration(200)	
				.style("opacity", .9);	
                if(className == "Horizontal")
                {
				div.style("left", rect.right + "px")			 
				.style("top", coord.top + "px");
                }
                else
                {
                    div.style("left", coord.right + "px")			 
				.style("top", rect.bottom + "px");
                }
			}