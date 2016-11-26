function cleanArray(actual) {
  var newArray = new Array();
  for (var i = 0; i < actual.length; i++) {
    if (actual[i]) {
      newArray.push(actual[i]);
    }
  }
  return newArray;
}

function generateit1() {
    var grps = document.getElementsByClassName("grouptable");
    var viewData = {
        //rects: []
    };
    for (var i = 0; i < grps.length; i++) {
        var arr = new Array();
        var rect = d3.select(grps[i]).select("rect");
        var hlines = grps[i].getElementsByClassName("Horizontal");
        var vlines = grps[i].getElementsByClassName("Vertical");

        hlinesArr = convertToArraySort(hlines, rect, "H");
        vlinesArr = convertToArraySort(vlines, rect, "V");
        hlines = hlinesArr[0];
        vlines = vlinesArr[0];
        delhlines = hlinesArr[1];
        delvlines = vlinesArr[1];

        console.log("deleted hlines ");
        printArr(delhlines);
        console.log("deleted vlines ");
        printArr(delvlines);
        //if there is no lines and only rect. Take care of broken part.
        for (var j = 0; j < hlines.length - 1; j++) {
            
            //if(j>=0 && rgb2hex(d3.select(hlines[j]).style("stroke")) == "#d7e3fe")
            //    continue;

            h_start = hlines[j];
            h_end = hlines[j + 1];

            for (var k = 0; k < vlines.length - 1; k++) {
                //if(k>=0 && rgb2hex(d3.select(vlines[k]).style("stroke")) == "#d7e3fe")
                //    continue;
                v_start = vlines[k];
                v_end = vlines[k + 1];

               res = getrectangle(h_start, h_end, v_start, v_end, j , k);
               arr.push(res);
            }
            
        }
        //printArr(hlines);
        //printArr(vlines);
        key = "grid" + (+i+1);
        viewData[key] = arr;
        mergeRectangles(viewData, delhlines, delvlines, key);
        viewData[key] = cleanArray(viewData[key]);
        
    }

    //mergeRectangles(viewData, delhlines, delvlines);
    //viewData.rects = cleanArray(viewData.rects);
    d3.select("#console").html("JSON Rects: " + JSON.stringify(viewData));

    return viewData;

}

function rectContainsDelLines(delhlines, x1, y1, x2, y2) {
    for (var i = 0; i < delhlines.length; i++) {
        if (delhlines[i]["x1"] == x1 && delhlines[i]["y1"] == y1 && delhlines[i]["x2"] == x2 && delhlines[i]["y2"] == y2)
            return true;
    }

    return false;
}

function mergeRectangles(viewData, delhlines, delvlines, key) {
    rects = viewData[key];
    type = "";
    for (var i = 0; i < rects.length; i++) {
        // some merged rects are marked as null. They should interfere in further processing.
        if (rects[i] == null)
            continue;

        //this is for horizontal lines only.
        cx1 = +rects[i]["x1"];
        cy1 = +rects[i]["y1"];
        cwidth = +rects[i]["width"];
        cheight = +rects[i]["height"];

        //Iss the deleted line same to upper or lower rectangle horizontal length. If yes get the boundry and compare that boundary with                 //other rectangles to be merged.
        merge = false;

        if (rectContainsDelLines(delhlines, cx1, cy1, +cx1 + +cwidth, cy1)) {
            type = "H";
            merge = true;
            hboundary = [{
                x1: +rects[i]["x1"],
                y1: +rects[i]["y1"],
                x2: +rects[i]["x1"] + +rects[i]["width"],
                y2: +rects[i]["y1"]
            }];

        } else if (rectContainsDelLines(delhlines, cx1, +cy1 + +cheight, +cx1 + +cwidth, +cy1 + +cheight)) {
            type = "H";
            merge = true;
            hboundary = [{
                x1: +rects[i]["x1"],
                y1: +rects[i]["y1"] + +rects[i]["height"],
                x2: +rects[i]["x1"] + +rects[i]["width"],
                y2: +rects[i]["y1"] + +rects[i]["height"]
            }];
        }


        //if there is no horizontal rect to be merged try for vertical ones
        if (!merge) {
            type = "V";
            if (rectContainsDelLines(delvlines, cx1, cy1, cx1, +cy1 + cheight)) {
                merge = true;
                hboundary = [{
                    x1: +rects[i]["x1"],
                    y1: +rects[i]["y1"],
                    x2: rects[i]["x1"],
                    y2: +rects[i]["y1"] + +rects[i]["height"]
                }];

            } else if (rectContainsDelLines(delvlines, +cx1 + +cwidth, cy1, +cx1 + +cwidth, +cy1 + +cheight)) {
                merge = true;
                hboundary = [{
                    x1: +rects[i]["x1"] + +rects[i]["width"],
                    y1: rects[i]["y1"],
                    x2: +rects[i]["x1"] + +rects[i]["width"],
                    y2: +rects[i]["y1"] + +rects[i]["height"]
                }];
            }
        }
        if (!merge)
            continue;

        //loop all other rects.
        for (var j = i + 1; j < rects.length; j++) {
            if (rects[j] == null)
                continue;
            c1x1 = +rects[j]["x1"];
            c1y1 = +rects[j]["y1"];
            c1width = +rects[j]["width"];
            c1height = +rects[j]["height"];

            if (type == "H") {
                merge = rectContainsDelLines(hboundary, c1x1, c1y1, +c1x1 + +c1width, c1y1) || rectContainsDelLines(hboundary, c1x1, +c1y1 + +c1height, +c1x1 + +c1width, +c1y1 + +c1height);
            } else if (type = "V") {
                merge = rectContainsDelLines(hboundary, c1x1, c1y1, c1x1, +c1y1 + +c1height) || rectContainsDelLines(hboundary, +c1x1 + +c1width, c1y1, +c1x1 + +c1width, +c1y1 + +c1height);
            }

            if (!merge)
                continue;
            //got the two merging rect. Find the coords.
            newRectx = Math.min(cx1, c1x1);
            newRecty = Math.min(cy1, c1y1);
            var newrowspan = null;
            var newcolspan = null;
            if(rects[i]["width"] == rects[j]["width"])
            {
                newRectwidth = rects[i]["width"];  
                newrowspan = rects[i]["rowspan"];
            }
            else
            {
                newRectwidth = (+rects[i]["width"] + +rects[j]["width"]);
                newrowspan = +rects[i]["rowspan"] + +rects[j]["rowspan"];

            }
            
            if(rects[i]["height"] == rects[j]["height"])
            {
                newRectheight = rects[i]["height"];
                newcolspan = rects[i]["colspan"];
            }
            else
            {
                newRectheight = (+rects[i]["height"] + +rects[j]["height"]);
                newcolspan = (+rects[i]["colspan"] + +rects[j]["colspan"]);
            }
            /*
            
            newRectwidth = rects[i]["width"] == rects[j]["width"] ? rects[i]["width"] : (+rects[i]["width"] + +rects[j]["width"]);
            
            newRectheight = rects[i]["height"] == rects[j]["height"] ? rects[i]["height"] : (+rects[i]["height"] + +rects[j]["height"]);
            */
            
            newrow = rects[i]["row"];
            newcol = rects[i]["col"];
            console.log(newRectx + " " + newRecty + " " + newRectwidth + " " + newRectheight);
            console.log(i + " " + j);
            delete rects[i];
            delete rects[j];
            var jsonData = {};
            //var ctm = line[i].parentNode.getCTM();  
            jsonData["x1"] = newRectx;
            jsonData["y1"] = newRecty;
            jsonData["width"] = newRectwidth;
            jsonData["height"] = newRectheight;
            jsonData["row"] = newrow;
            jsonData["col"] = newcol;
            jsonData["rowspan"] = newrowspan;
            jsonData["colspan"] = newcolspan;
            rects[i] = jsonData;

            //merged rect at i. redo for i.
            i = i - 1;
            break;

        }
    }
}

//applying scaling and translation to all the X and y coord
function applyTransitions(fmtArray, ctm)
{
    lines = fmtArray[0];
    dlines = fmtArray[1];
    
    for(var i=0; i<lines.length; i++)
    {
        line = lines[i];
        line["x1"] = ctm.a*line["x1"] + ctm.e;
        line["x2"] = ctm.a*line["x2"] + ctm.e;
        line["y1"] = ctm.d*line["y1"] + ctm.f;
        line["y2"] = ctm.d*line["y2"] + ctm.f;
    }
    
    for(var i=0; i<dlines.length; i++)
    {
        line = dlines[i];
        line["x1"] = ctm.a*line["x1"] + ctm.e;
        line["x2"] = ctm.a*line["x2"] + ctm.e;
        line["y1"] = ctm.d*line["y1"] + ctm.f;
        line["y2"] = ctm.d*line["y2"] + ctm.f;
    }
}

function formattedArray(sLinesArr, rect, type) {
    rx1 = rect.attr("x");
    ry1 = rect.attr("y");
    rwidth = rect.attr("width");
    rheigth = rect.attr("height");
    console.log("Rect CTM is ");
    console.log(rect[0][0].getCTM());
    var tmpAry = new Array();

    count = 0;

    if (type == "H")
        cline = {
            x1: rx1,
            y1: ry1,
            x2: +rx1 + +rwidth,
            y2: ry1
        };
    else
        cline = {
            x1: rx1,
            y1: ry1,
            x2: rx1,
            y2: +ry1 + +rheigth
        };
    tmpAry[count++] = cline;

    name_set = {};

    dellines = new Array();

    for (var j = 0; j < sLinesArr.length; j++) {
        
        deletedLine = sLinesArr[j].style.stroke;
        
        if (deletedLine != null && rgb2hex(deletedLine) == "#d7e3fe") {
            dline = {
                x1: sLinesArr[j].getAttribute("x1"),
                y1: sLinesArr[j].getAttribute("y1"),
                x2: sLinesArr[j].getAttribute("x2"),
                y2: sLinesArr[j].getAttribute("y2")
            }
            dellines.push(dline);
        }
        //add translation and scaling logic here.
        if (name_set.hasOwnProperty(sLinesArr[j].getAttribute("name")))
            continue;

        if (sLinesArr[j].getAttribute("name") != null) {
            name_set[sLinesArr[j].getAttribute("name")] = true;

            samelines = document.getElementsByName(sLinesArr[j].getAttribute("name"));
            if (type == "H") {
                _x1 = getMin(samelines, type);
                _x2 = getMax(samelines, type);
                _y1 = _y2 = sLinesArr[j].getAttribute("y2");
            } else if (type == "V") {
                _x1 = _x2 = sLinesArr[j].getAttribute("x2");
                _y1 = getMin(samelines, type);
                _y2 = getMax(samelines, type);
            }
            cline = {
                x1: _x1,
                y1: _y1,
                x2: _x2,
                y2: _y2
            };
            
        } else {
            
            cline = {
                x1: sLinesArr[j].getAttribute("x1"),
                y1: sLinesArr[j].getAttribute("y1"),
                x2: sLinesArr[j].getAttribute("x2"),
                y2: sLinesArr[j].getAttribute("y2")
            };
        }
        tmpAry[count++] = cline;

    }

    if (type == "H")
        cline = {
            x1: rx1,
            y1: +ry1 + +rheigth,
            x2: +rx1 + +rwidth,
            y2: +ry1 + +rheigth
        };
    else
        cline = {
            x1: +rx1 + +rwidth,
            y1: ry1,
            x2: +rx1 + +rwidth,
            y2: +ry1 + +rheigth
        };;
    tmpAry[count] = cline;

    return [tmpAry, dellines];
}

function sortByPosition(a, b) {
    a = d3.select(a);
    b = d3.select(b);
    if (a.attr("x1") == b.attr("x1")) return a.attr("y1") - b.attr("y1");
    return a.attr("x1") - b.attr("x1");
}

function convertToArraySort(inputArr, rect, type) {
    var tmpAry = new Array();
    for (var i = 0; i < inputArr.length; i++) {
        tmpAry[i] = inputArr[i];
    }
    tmpAry.sort(sortByPosition);

    fmtArray = formattedArray(tmpAry, rect, type);

    //applying transformation.
    ctmMatrix = rect[0][0].getCTM();
    applyTransitions(fmtArray, ctmMatrix); 
    return fmtArray;
}

function getrectangle(h_start, h_end, v_start, v_end, row, col) {
    //console.log(v_start["x1"] + "   " + h_start["y1"] + " ");
    //console.log((+v_end["x1"] - +v_start["x1"]) + " " + (+h_end["y1"] - +h_start["y1"]) + " ");
    //console.log("next");
if(typeof(row) === 'undefined')
    row = -1;
if(typeof(col) === 'undefined')
    col = -1;
    var jsonData = {};
    //var ctm = line[i].parentNode.getCTM();  
    jsonData["x1"] = v_start["x1"];
    jsonData["y1"] = h_start["y1"];
    jsonData["width"] = (+v_end["x1"] - +v_start["x1"]);
    jsonData["height"] = (+h_end["y1"] - +h_start["y1"]);
    jsonData["row"] = row;
    jsonData["col"] = col;
    jsonData["rowspan"] = 1;
    jsonData["colspan"] = 1;
    //viewData.rects.push(jsonData);
    return jsonData;

}

function getMin(samelines, type) {
    if (type == "H")
        coord = "x1";
    else
        coord = "y1";

    min = Number.MAX_VALUE;
    for (var i = 0; i < samelines.length; i++) {
        val = samelines[i].getAttribute(coord);
        min = Math.min(min, val);
    }

    return min;
}

function getMax(samelines, type) {
    if (type == "H")
        coord = "x2";
    else
        coord = "y2";

    max = Number.MIN_VALUE;
    for (var i = 0; i < samelines.length; i++) {
        val = samelines[i].getAttribute(coord);
        max = Math.max(max, val);
    }

    return max;
}

//helper function
function printArr(inputArr) {
    for (var i = 0; i < inputArr.length; i++) {
        console.log(inputArr[i]);
    }

}

function cerealize(node) {
    console.log("Nimesh ");
    console.log(node);
    var svgxml = (new XMLSerializer()).serializeToString(node);
    svgxml = svgxml.replace(/ xlink:xlink/g, ' xmlns:xlink');
    svgxml = svgxml.replace(/ href/g, 'xlink:href');
    console.log(svgxml);
    return svgxml;
}

function rgb2hex(rgb) {
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "#" +
        ("0" + parseInt(rgb[1], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[2], 10).toString(16)).slice(-2) +
        ("0" + parseInt(rgb[3], 10).toString(16)).slice(-2) : '';
}

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

//All the groups have classname as grouptable. Traverse each group and lines int eh group and get them to the surface.
//append child gets the line from current to last location and svg/d3 shows content based on order.
function getLinesToSurface(lineType) {
    //Is class name required. Change to byTagName("g"). Use classname for something else.
    //There might be lots of groups and we only want the groups which has lines. Hence, this class is necessay.
    var grps = document.getElementsByClassName("grouptable");
    for (var j = 0; j < grps.length; j++) {
        var currgrp = grps[j];
        var elements = currgrp.getElementsByClassName(lineType);
        for (var i = 0; i < elements.length; i++) {
            var cline = elements[0];
            cline.parentNode.appendChild(cline);
        }
    }
}

function EraseAllGroups() {
    var grps = document.getElementsByClassName("grouptable");
    var len = grps.length;
    for (var i = 0; i < len; i++) {
        grps[0].remove();
    }
}

//adding lines based on the parameter. stroke and stroke width is only for deleted lines. 
//# Imp. There is .on event.
function addlines(container, x1, x2, y1, y2, name, className, stroke, strokewidth, isdel, forceMarker) {
    if(typeof(isdel) === 'undefined')
            isdel = false;
    if(typeof(forceMarker) === 'undefined')
            forceMarker = false;
    
     marker = false;
    rect = d3.select(container).select("rect");
    if(Math.abs(+rect.attr("x") + +rect.attr("width") - x2) <=7)
        marker = true;
    else if(Math.abs(+rect.attr("y") + +rect.attr("height") - y2) <=7)
        marker = true;

    //this case is when you keep toggling the deleted line. Unnecessary dot are created.
    if (Math.abs(x1 - x2) == 0 && Math.abs(y1 - y2) == 0)
        return;
    line = d3.select(container).append("line")
        .attr("x1", x1)
        .attr("y1", y1)
        .attr("x2", x2)
        .attr("y2", y2)
    //remove this id after complete check.
        .attr("id", name)
        .attr("name", name)
        .attr("class", className)
        .call(drag)
        .on("click", mousedown2);

    line.style("stroke-width", 3/_scale);
    
    if (stroke != null) {
        line.style("stroke", stroke);
        //add hover effect for the deleted line.
        //this for new green line intro.
        if(isdel)
        {
            line.on("mouseover",linemousehover)
                .on("mouseout", linemouseout);
        }
    }
    if (strokewidth != null) {
        line.style("opacity", "0.1");
    }
    if((marker && stroke==null) || forceMarker)
        line.attr("marker-end", "url(#triangle)");
    if(!isdel)
    {
    line.on("mouseover", tooltip);
    line.on("mouseout", removeTooltip);
    }
}

//#Imp for load.
function createCrossHair(svg, width, height)
{
var crossHair = svg.append("g")
.attr("id", "crosshair");
//vertical crosshair
crossHair.append("line").attr("id", "v_crosshair")
    .attr("class", "crosshair")
    .attr("x1", 0)
    .attr("y1", -height)
    .attr("x2", 0)
    .attr("y2", height)

crossHair.append("line").attr("id", "h_crosshair")
    .attr("class", "crosshair")
    .attr("x1", 0)
    .attr("y1", 0)
    .attr("x2", width)
    .attr("y2", 0)

//text label for cross hair
var crossHairTextData1 = vis.append("g")
.attr("id", "crosshair_text");
crossHairTextData1.append("text")
    .style("background", "white");

var crossHairTextData2 = svg.append("g")
.attr("id", "crosshair_text");
crossHairTextData2.append("text")

var crossHairTextValue = svg.append("g")
.attr("id", "crosshair_text");
crossHairTextValue.append("text")

svg.on("mousemove", function () {
    var xCoord = d3.mouse(this)[0],
        yCoord = d3.mouse(this)[1];
    addCrossHair(xCoord, yCoord);
})
    .on("mouseover", function () {
    d3.selectAll(".crosshair").style("display", null);
})
    .on("mouseout", function () {
    d3.selectAll(".crosshair").style("display", "none");
})
    .append("rect")
    .style('visibility', 'hidden')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height);
}

function addCrossHair(xCoord, yCoord) {
    // Update horizontal cross hair
    d3.select("#h_crosshair")
        .attr("x1", 0)
        .attr("y1", yCoord)
        .attr("x2", width)
        .attr("y2", yCoord)
        .style("display", "block");
    // Update vertical cross hair
    d3.select("#v_crosshair")
        .attr("x1", xCoord)
        .attr("y1", -height)
        .attr("x2", xCoord)
        .attr("y2", height)
        .style("display", "block");

}

//deleting entire line when click 5px. Deprecated Should be removed.
function deleteEntireLines(_this) {
    var c = d3.mouse(_this);

    //deleting the line when clicked at the start or the end. Consider for vertical lines and deleted lines. deleting line can be done in //any mode.
    var currelement = d3.select(_this);
    if ((currelement.attr("class") == "Horizontal" && (Math.abs(c[0] - currelement.attr("x2")) <= 5 || Math.abs(c[0] - currelement.attr("x1")) <= 5)) ||
        (currelement.attr("class") == "Vertical" && (Math.abs(c[1] - currelement.attr("y2")) <= 5 || Math.abs(c[1] - currelement.attr("y1")) <= 5))) {
        cid = currelement.attr("name");
        //cid null means this is a normal red line. id cid is some unique id means lines is the broken one.
        //if stoke is some hes other than red than line is the broken one.
        if (cid != null) {
            var allhlines = document.getElementsByName(cid); //this.parentNode.getElementsByClassName("Horizontal");
            
            for (var i = 0; i < allhlines.length; i++) {
                allhlines[i].remove();
            }
        }
        _this.remove();
        return true;
    }

    return false;
}

//when the current line is clicked it gets the intersecting points for seg remmoval.
function getIntersectingPoints(_this) {
    var m = d3.mouse(_this);
    var currx = m[0];
    var curry = m[1];
    currg = _this.parentNode
    grect = d3.select(currg).select("rect");


    if (d3.select(_this).attr("class") == "Horizontal") {
        elements = currg.getElementsByClassName("Vertical");
        coord = "x1";
        max_start = grect.attr("x");
        min_end = +grect.attr("x") + +grect.attr("width");
        start = new Point(max_start, curry);
        end = new Point(min_end, curry);
        cmpxory = currx;
    } else {
        elements = currg.getElementsByClassName("Horizontal");
        coord = "y1";
        max_start = grect.attr("y");
        min_end = +grect.attr("y") + +grect.attr("height");
        start = new Point(currx, max_start);
        end = new Point(currx, min_end);
        cmpxory = curry;
        
    }

    //getting the max of all the lines to the left and min of all the lines to the right.
    for (var i = 0; i < elements.length; i++) {
        var vline = elements[i];
        if (vline.getAttribute(coord) >= cmpxory) {
            min_end = Math.min(min_end, vline.getAttribute(coord));
        } else {
            max_start = Math.max(max_start, vline.getAttribute(coord));
        }
    }
    if (d3.select(_this).attr("class") == "Horizontal") {
        start.x = max_start;
        end.x = min_end;
    } else {
        start.y = max_start;
        end.y = min_end;
    }

    return [start, end];
}

function parseXml(xml) {
   var dom = null;
   if (window.DOMParser) {
      try { 
         dom = (new DOMParser()).parseFromString(xml, "text/xml"); 
      } 
      catch (e) { dom = null; }
   }
   else if (window.ActiveXObject) {
      try {
         dom = new ActiveXObject('Microsoft.XMLDOM');
         dom.async = false;
         if (!dom.loadXML(xml)) // parse error ..

            window.alert(dom.parseError.reason + dom.parseError.srcText);
      } 
      catch (e) { dom = null; }
   }
   else
      alert("cannot parse xml string!");
   return dom;
}

function leaveChange() {

    var mode = document.getElementById('mode').value;
    document.getElementById("fileInput").style.visibility = "hidden";

    if (mode == "CT") {
        //createbutton();
    } 
    else {
        //if it is not create table mode then hide the button.
        //document.getElementById("createTable").style.visibility = "hidden";

        //Refresh delete all groups.
        if (mode == "R") {
            EraseAllGroups();
            d3.select("#console").html("");

        } else if (mode == "S") {
            //json for rects.
            jsonVal = generateit1();
            d3.select("#console").html(JSON.stringify(jsonVal));

            
            var blob1 = new Blob([JSON.stringify(jsonVal)], {type: "application/json;charset=utf-8"});
            saveAs(blob1, "svg_json.json");  
            
            //this is serialize fr load and save.            
            dom = parseXml(cerealize(d3.select("g").node()));
            json = xml2json(dom);
            json = json.replace("undefined","");
            json_obj = JSON.parse(json);
            myobj = json_obj["g"]["g"];
            myobj.splice(0,4);
            console.log("#debug");
            //no need to save circle.
            for(var i=0; i<myobj.length; i++)
            {
                //delete myobj[i]["circle"];
                //console.log(myobj[i]["circle"]);
            }
            //d3.select("#console").html(JSON.stringify(myobj));

            //this is xml blob.
            /*var blob = new Blob([cerealize(d3.select("svg").node())], {type: "text/plain;charset=utf-8"});*/
            
            //this is json blob. Saving file in json instead of blob.
            output = {"g":json_obj["g"]["g"]};
            var blob = new Blob([JSON.stringify(output)], {type: "text/plain;charset=utf-8"});
            saveAs(blob, "svg_html.json");   
            
            completejson = {"svg_html" : output, "svg_json" : jsonVal};
            _completejson = {"myid":"filaname", "filename1" : completejson};
            console.log(JSON.stringify(_completejson));
            
            var blob3 = new Blob([JSON.stringify(_completejson)], {type: "text/plain;charset=utf-8"});
            saveAs(blob3, "svg_html_json.json");   
            //testing xml
            /*
            xml2 = json2xml(eval(test));
            console.log("NJ");
            console.log(xml2);
            d3.select("#console").html(xml2);
            */
            mytester();
        }
        //if it is Erase mode then get the lines to the surface.
        else if (mode == "EH" || mode == "EV") {
            var className = ""
            if (mode == "EH")
                className = "Horizontal";
            else
                className = "Vertical";
            //Is there a need to getLines on the surface. I don't remember why I used it.
            //depreciated. remove.
            getLinesToSurface(className);
        }
        else if(mode == "L")
        {
            //readTextFile("C:\\Users\\Nimesh\\Desktop\\New folder\\Original\\dig-crowd-sourcing-master\\image_annotator - 2\\svg_html.txt");
            //readTextFile("sample.txt");
            
            document.getElementById("fileInput").style.visibility = "visible";
    		var fileInput = document.getElementById('fileInput');
            fileInput.addEventListener('change', function(e) {
			var file = fileInput.files[0];
			var textType = /text.*/;

			if (file.type.match(textType) || true) {
				var reader = new FileReader();

				reader.onload = function(e) {
                   //alert(reader.result);
                    readTextFile(reader.result);
				}

				reader.readAsText(file);	
			} else {
				alert("File not supported!");
			}
		});
            
        }
    }
}


//creates add table button when the drop down is CT r Create Table. depreciated.
function createbutton() {
    var tablebutton = document.getElementById("createTable")
    tablebutton.style.visibility = "visible";
    tablebutton.onclick = createGrid;
}

//dragging rect and all the element inside rect. Need changes for other circle.
function dragPoint() {
    dx1 = d3.event.dx;
    dy1 = d3.event.dy;

    gpar = this.parentNode;
    var children = gpar.childNodes;

    //topright, bottomleft. class of the circle.
    var corner = d3.select(this).attr("class");

    _rect = d3.select(gpar).select("rect");
    console.log(_rect.attr("x"));
    console.log("printed");
    for (var i = 0; i < children.length; i++) {
        curr = children[i];
        if (curr.tagName == 'rect') {
            d3.select(curr)
                .attr("width", +curr.getAttribute("width") + dx1)
                .attr("height", +curr.getAttribute("height") + dy1);
        } else if (curr.tagName == 'circle') {
            d3.select(curr)
                .attr("cx", +curr.getAttribute("cx") + dx1)
                .attr("cy", +curr.getAttribute("cy") + dy1);
        } else if (curr.tagName == 'line') {
            if (corner == "bottomright") {
                if (curr.className.baseVal == 'Horizontal') {
                    d3.select(curr)
                        // .attr("x1", +curr.getAttribute("x1") + dx1)
                        .attr("x2", +curr.getAttribute("x2") + dx1)
                        .attr("y2", +curr.getAttribute("y2") + dy1)
                        .attr("y1", +curr.getAttribute("y1") + dy1);
                    
                    //REsize broken line. delete intersection and resize to check issue.
                    x1 = d3.select(curr).attr("x1");

                    if(Math.abs((x1) - (_rect.attr("x"))) >=4)
                    {
                        d3.select(curr)
                         .attr("x1", +curr.getAttribute("x1") + dx1)
                    }
                }
                if (curr.className.baseVal == 'Vertical') {
                    d3.select(curr)
                        .attr("x2", +curr.getAttribute("x2") + dx1)
                        .attr("x1", +curr.getAttribute("x1") + dx1)
                        .attr("y2", +curr.getAttribute("y2") + dy1);
                    
                    y1 = d3.select(curr).attr("y1");

                    if(Math.abs((y1) - (_rect.attr("y"))) >=4)
                    {
                        d3.select(curr)
                         .attr("y1", +curr.getAttribute("y1") + dy1)
                    }
                }
            }
        }
    }

}

function readTextFile(svgdata)
{
 
    //d3.select("svg").remove();
    //bug here. No need to add a group.
    xml2 = json2xml(eval(JSON.parse(svgdata)));
    vis.append("g").html(xml2);    /*
vis = svg = d3.select("svg")
                .on("mousemove", mousemove)
                .call(d3.behavior.zoom().on("zoom", function () {
                    var mode = document.getElementById('mode').value;
                    if (mode == "Z")
                        svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
                        }));
    
        svg.on("mousemove", function () {
            var xCoord = d3.mouse(this)[0],
                yCoord = d3.mouse(this)[1];
            addCrossHair(xCoord, yCoord);
        })
            .on("mouseover", function () {
            d3.selectAll(".crosshair").style("display", null);
        })
            .on("mouseout", function () {
            d3.selectAll(".crosshair").style("display", "none");
        });    
    */
    addevents();
}

function addevents()
{
    /*
            pointElement1 = newg.append('circle').attr('class', 'bottomright').attr('r', 5).attr('cx', _x+100).attr('cy', _y+100).call(dragC1);
    */
    var grps = document.getElementsByClassName("grouptable");
        for (var i = 0; i < grps.length; i++) {
        currgrp = d3.select(grps[i]);
        currgrp.selectAll("rect")
            .on("mousedown", mousedown)
            .call(drag);
        currgrp.selectAll("line")
            .on("mousedown", mousedown2)
            .on("mouseup", mouseup)
            .on("mouseover", tooltip)
            .on("mouseout", removeTooltip)
            .call(drag);

        /*
        pointElement1 = currgrp.append('circle').attr('class', 'bottomright').attr('r', 5).attr('cx', _x+100).attr('cy', _y+100).call(dragC1);
        */
        currgrp.selectAll("circle")
            .call(dragC1);
        
        }
}

function mytester()
{
    if(true)
        return;
    
    res  = fun();
    console.log(res);
    alert(res);
    
}

function fun() 
{
    var data = null;
   $.post("http://localhost:8080/CrunchifyRESTJerseyExample/crunchify/ctofservice/", function(response) {
        data = response;
       alert(data);
   }).error(function(){
  alert("Sorry could not proceed");
});

   return data;
}

function linemousehover(_this=null)
{
    cline = d3.select(this);
    if(rgb2hex(cline.style("stroke")) == "#d7e3fe") 
    {
        cline.style("opacity", "1.0");
    }
    
}
function linemouseout(_this=null)
{
  cline = d3.select(this);
    if(rgb2hex(cline.style("stroke")) == "#d7e3fe") 
    {
        cline.style("opacity", "0.0");
         cline.style("stroke", "#d7e3fe");
    }
}